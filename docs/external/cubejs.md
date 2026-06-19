# External: Cube.js como camada de API do Data Warehouse

> Status: **escopo e local no monorepo decididos** (`apps/api`, schema
> versionado, escopo = somente leitura sobre o dataset `core`). O que falta
> decidir é só o **alvo de deploy** (self-hosted vs. Cube Cloud) e detalhes
> de autenticação/protocolo — ver "Pontos abertos" abaixo.

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

- Consultas de medidas/dimensões sobre o dataset `core` (`dim_indicadores`,
  `fact_indicadores`, `dim_localidades`) — o caso de uso principal, e o que
  substitui as rotas atuais em `src/app/api/indicadores/*`.

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
├── cube.js          # config de conexão com o BigQuery (dataset core)
├── model/
│   ├── cubes/        # 1 cubo por dim_*/fact_* do dataset core
│   └── views/        # views compostas para o frontend consumir
├── Dockerfile         # caminho self-hosted
└── .env.example
```

Por que já é um app real e não um placeholder: Cube.js (JS) e o DW (Python)
não compartilham código — só um **contrato de dados** (as tabelas que
`apps/datawarehouse` materializa no dataset `core`). O schema dos cubos
depende desse contrato, não da decisão de deploy. Por isso o schema pode (e
deve) ser versionado e evoluído desde já, mesmo com o deploy ainda indefinido.

## Pontos abertos (decidir em issue antes de implementar o deploy)

- **Self-hosted (Cloud Run/Docker, usando o `Dockerfile` de `apps/api`) vs.
  Cube Cloud** — trade-off custo vs. controle/infra. Não bloqueia escrever o
  schema dos cubos, só o deploy final.
- **Autenticação**: como o Cube.js valida quem pode consultar o quê (hoje o
  frontend usa Firebase Auth; é preciso decidir se o Cube.js valida o token
  do Firebase ou se fica atrás de uma API própria que já faz essa validação).
- **Protocolo de consumo no frontend**: REST API do Cube.js vs. o pacote
  `@cubejs-client/core` (+ `@cubejs-client/react` se for usar os hooks
  React direto nos componentes, o que mudaria bastante
  `src/hooks/useIndicadores.ts` e companhia).
- **Onde rodam as pre-agregações** (cache do Cube.js) — BigQuery tem custo por
  query, então pre-agregações podem ser relevantes para custo, mas exigem um
  storage próprio (Cube Store) ou usar o próprio BigQuery como destino.
- **Convivência transitória**: durante a migração, as rotas atuais
  (`src/app/api/indicadores/*`) podem continuar existindo enquanto o Cube.js
  é introduzido aos poucos (ex.: um indicador por vez), para não travar o
  frontend numa migração big-bang.

## Referências

- Site oficial: https://cube.dev
- Driver BigQuery do Cube.js existe nativamente (`@cubejs-backend/bigquery-driver`).
