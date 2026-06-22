# External: Cube.js como camada de API do Data Warehouse

> Status: **escopo, local no monorepo e alvo de deploy decididos**
> (`apps/api`, schema versionado, escopo = somente leitura sobre o dataset
> `gold`, deploy = self-hosted via Cloud Run, decidido em 2026-06-22). O que
> falta decidir são detalhes de autenticação/protocolo e se/como usar um
> bucket GCS de apoio (pre-agregações/export do BigQuery) — ver "Pontos
> abertos" abaixo.

## Por que considerar o Cube.js

Hoje (`src/lib/analytics/client.ts`, `src/services/indicadores.ts` e as rotas
em `src/app/api/indicadores/*`) o Next.js fala BigQuery diretamente: monta
SQL/usa o SDK do `@google-cloud/bigquery`, conhece nomes de dataset/tabela e
faz a lógica de filtro/agregação na própria rota de API.

O Cube.js (https://cube.dev) propõe uma camada semântica entre o app e o
warehouse: você define **cubos** (medidas, dimensões, joins) em código
(YAML/JS) e ele expõe isso via REST, GraphQL ou um endpoint compatível com
SQL, cuidando de cache, pre-agregações e geração de SQL otimizado para o
BigQuery.

## Escopo: o que o Cube.js cobre e o que **não** cobre

Cube.js é uma camada **analítica e somente-leitura**. Ele cobre bem:

- Consultas de medidas/dimensões sobre o dataset `gold` (`dim_indicadores`,
  `fact_indicadores`, `dim_localidades`) — o caso de uso principal, e o que
  substitui as rotas atuais em `src/app/api/indicadores/*`. A service
  account do Cube.js só tem IAM de leitura em `gold` (nunca em
  `raw`/`silver`/`ops`) — ver `docs/architecture.md` seção 2.

O dataset `ops` (metadados do próprio DW) **não** é exposto via Cube.js —
decisão fechada, ver `docs/architecture.md` seção 3.1. Ele tem API própria
(FastAPI, dentro de `apps/datawarehouse/src/observatudo/api/`), porque
metadado de pipeline é mais registro/status do que medida agregável, e essa
API já precisa nascer pensando em crescer para ações/mutações — coisa que o
Cube.js não faz por design.

Cube.js **não cobre** (e não deve ser forçado a cobrir):

- Mutações/ações — ex.: disparar um reprocessamento, marcar um job como
  revisado, escrever um log via API. Ele não tem esse conceito por design.
  Se essa necessidade aparecer, a API correspondente deve ser uma API fina
  separada dentro de `apps/datawarehouse` (ex.: FastAPI chamando as mesmas
  funções Python do pipeline) — não uma extensão forçada do Cube.js. Ver
  `docs/architecture.md`, seção 3 ("Limites do Cube.js"). Essa API de ação
  **não está sendo construída agora**, é só uma costura reservada.

## Onde ele vive no monorepo

`apps/api` — um app pnpm/Node real desde já (não placeholder), com:

```
apps/api/
├── package.json
├── cube.js          # config de conexão com o BigQuery (dataset gold)
├── model/
│   ├── cubes/        # 1 cubo por dim_*/fact_* do dataset gold
│   └── views/        # views compostas para o frontend consumir
├── Dockerfile         # caminho self-hosted
└── .env.example
```

Por que já é um app real e não um placeholder: Cube.js (JS) e o DW (Python)
não compartilham código — só um **contrato de dados** (as tabelas que
`apps/datawarehouse` materializa no dataset `gold`). O schema dos cubos
depende desse contrato, não da decisão de deploy — que, aliás, já foi
tomada e aplicada (ver "Status" abaixo).

## Status: scaffold implementado (2026-06-22)

`apps/api` criado como app real: `package.json` (`@cubejs-backend/server` +
`@cubejs-backend/bigquery-driver`), `cube.js` (config mínima — conexão é
toda via env vars), `model/cubes/{dim_indicadores,dim_localidades,
fact_indicadores}.js` (um cubo por tabela do dataset `gold`, com os joins
`fact_indicadores` → `dim_indicadores`/`dim_localidades`), `model/views/
indicadores.js` (view denormalizada candidata a substituir
`src/app/api/indicadores/*`), `Dockerfile` (caminho self-hosted) e
`.env.example`. Validado de ponta a ponta em dev local: `cubejs-dev-server`
sobe, `/cubejs-api/v1/meta` compila os 3 cubos + a view, e uma query real
(`fact_indicadores.count`/`valor_medio` agrupado por `dim_indicadores.nome`/
`unidade`) retorna dados reais do BigQuery via ADC (mesma auth do resto do
projeto). Achado durante a validação (pré-existente, não introduzido por
este scaffold): os 4 componentes individuais do CAPAG (`CAPAG -
Endividamento`/`Poupança Corrente`/`Liquidez`/`Nota Final`, 5598 linhas
cada) existem em `fact_indicadores` mas não têm linha correspondente em
`dim_indicadores` (que só tem o índice agregado `capag`) — aparece como
join órfão (`dim_indicadores.nome = null`) em qualquer query que cruze as
duas tabelas sem filtrar por isso; decisão de como tratar isso ainda não
tomada.

Nota de ambiente: `@cubejs-backend/native` (usado para parsing
SQL/Jinja) baixa um binário pré-compilado no `postinstall` — se ele falhar
silenciosamente (ex.: instalação sem rede no momento do `postinstall`), o
servidor sobe mas todo schema falha ao compilar com "Unable to load
@cubejs-backend/native"; rodar `pnpm install` novamente (ou `npx
post-installer` dentro de `node_modules/@cubejs-backend/native`) resolve.

Achado em produção (2026-06-22): com `NODE_ENV=production`, o Cube exige
por padrão um cluster externo de Cube Store (`CUBEJS_CUBESTORE_HOST`/
`PORT`) pra cache/fila de queries — `/cubejs-api/v1/load` falhava com
"Cube Store was specified as queue/cache driver". Resolvido com
`CUBEJS_CACHE_AND_QUEUE_DRIVER=memory`, o driver documentado pra
deployments single-instance pequenos (nosso caso: 1 serviço Cloud Run,
sem necessidade de cache distribuído ainda). Reconsiderar se/quando houver
múltiplas instâncias ou pre-agregações pesadas.

## Pontos abertos

- **Deploy: self-hosted via Cloud Run — decidido, provisionado e em
  produção (2026-06-22)**. `infra/cubejs.tf`: SA dedicada, IAM
  `dataViewer` só em `gold`, `storage.objectAdmin` no bucket `*-www-data`
  (apoio a `CUBEJS_DB_EXPORT_BUCKET`), serviço Cloud Run
  `cubejs-observatudo`. CI/CD (`.github/workflows/
  build-and-deploy-cubejs.yml`) publica a imagem real (com `model/`
  embutido) a cada push em `apps/api/**` — validado servindo dados reais
  via `/cubejs-api/v1/load` em produção. Pre-agregação/export bucket: IAM
  pronta, mas a configuração concreta de uso ainda não foi feita (ver
  bullet "Pre-agregações" abaixo).
- **Autenticação**: como o Cube.js valida quem pode consultar o quê (hoje o
  frontend usa Firebase Auth; é preciso decidir se o Cube.js valida o token
  do Firebase ou se fica atrás de uma API própria que já faz essa validação).
  Por ora, o `run.invoker` do Cloud Run está `allUsers` (mesmo padrão do
  frontend) e a única barreira real é o `CUBEJS_API_SECRET` — decisão
  consciente de manter assim por ora (2026-06-22); reconsiderar restringir
  o invoker quando essa autenticação for desenhada de fato.
- **Protocolo de consumo no frontend**: REST API do Cube.js vs. o pacote
  `@cubejs-client/core` (+ `@cubejs-client/react` se for usar os hooks
  React direto nos componentes, o que mudaria bastante
  `src/hooks/useIndicadores.ts` e companhia).
- **Pre-agregações**: BigQuery tem custo por query, então pre-agregações
  podem ser relevantes para custo; direção decidida (usar o bucket GCS
  existente como apoio), mas a configuração concreta (Cube Store local vs.
  destino no próprio BigQuery vs. export bucket) ainda não foi feita.
- **Convivência transitória**: durante a migração, as rotas atuais
  (`src/app/api/indicadores/*`) podem continuar existindo enquanto o Cube.js
  é introduzido aos poucos (ex.: um indicador por vez), para não travar o
  frontend numa migração big-bang.

## Referências

- Site oficial: https://cube.dev
- Driver BigQuery do Cube.js existe nativamente (`@cubejs-backend/bigquery-driver`).
