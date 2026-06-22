---
id: ISSUE-0007
title: Fase 6 — Migrar o frontend rota a rota para Cube.js
status: review
priority: high
type: refactor
owner: agent
created_at: 2026-06-22
updated_at: 2026-06-22
tags:
  - frontend
  - cubejs
  - refactor
related_files:
  - apps/frontend/src/lib/cubejs/client.ts
  - apps/frontend/src/app/api/indicadores/search
  - apps/frontend/src/app/api/indicadores/nomeados
  - apps/frontend/src/app/api/indicadores/localidade/[municipio_id]/route.ts
  - apps/frontend/src/services/indicadores.ts
  - apps/frontend/src/components/MetricCard/MetricCard.tsx
---

# Resumo

Substituídas as 3 rotas do frontend que tinham consumidor real para
consumir Cube.js via proxy server-side, em vez de acessar BigQuery
diretamente. Acesso direto ao BigQuery removido por completo do frontend
(código, dependência e IAM).

# Problema

`src/app/api/indicadores/*` consultava BigQuery direto via
`lib/analytics/{client,query,runQuery}.ts`, com uma query por rota sem
reuso de modelo semântico, e a SA do frontend (`www_app`) tinha IAM de
leitura direto no BigQuery — superfície maior que o necessário agora que
o Cube.js (`ISSUE-0006`) existe.

# Objetivo

Mesmo contrato HTTP para o browser (nenhuma rota muda de formato pro
cliente), mas por dentro as rotas passam a chamar o Cube.js via
`@cubejs-client/core`, autenticando com um JWT assinado a partir de
`CUBEJS_API_SECRET` no servidor — o browser nunca vê esse secret nem fala
com o Cube.js direto. Evita reabrir a questão de autenticação de usuário
(Firebase) no Cube.js por agora.

# O que foi feito

- Protocolo de consumo fechado: proxy server-side
  (`apps/frontend/src/lib/cubejs/client.ts`).
- Código morto sem consumidor real removido antes de migrar: `/api/
  indicadores` bare, `/api/indicadores/list`, `hooks/useIndicadores.ts`,
  `hooks/olduseIndicadoresDashboard.ts`, exports não usados em
  `lib/analytics/dimensions/`+`measures/` — investigado via histórico do
  git antes de apagar, confirmado que cada um foi criado para uma feature
  que não vingou.
- `/api/indicadores/search` migrado: `buscarIndicadores()` consulta o
  cubo `dim_indicadores` via Cube.js (filtro `contains` case-insensitive
  em nome/descrição + `equals` em indicador_id).
- `/api/indicadores/nomeados` migrado: `nomesIndicadores()` consulta
  `dim_indicadores` via Cube.js (`equals` com múltiplos valores =
  semântica de IN). Validado contra produção.
- `/api/indicadores/localidade/[municipio_id]` migrado (rota do dashboard
  principal): `IndicadorCivico.serieHistoricaBatch()` substitui
  `serieHistorica()` — antes era 1 consulta por indicador x localidade ao
  BigQuery (N×3 round-trips por carga de página); agora é 1 única
  consulta ao Cube.js para todos os indicadores e as 3 localidades
  (município/estado/país) de uma vez, agrupada no código depois.
- Removido por completo o acesso direto ao BigQuery do frontend:
  `lib/analytics/{client,query,runQuery}.ts` apagados, dependência
  `@google-cloud/bigquery` removida do `package.json`. `/api/healthz`
  (fazia `dryRun` direto no BigQuery) migrado para checar
  `${CUBEJS_API_URL}/readyz`. IAM da SA `sa-observatudo-www-app` revogado
  em produção (`dataViewer` em `gold` + `bigquery.jobUser`) — confirmado
  via grep que nenhum código mais usava, aplicado via Terraform.
- `infra/main.tf`: serviço Cloud Run do frontend ganhou `CUBEJS_API_URL`
  (referência dinâmica, não hardcoded) e `CUBEJS_API_SECRET`;
  `.github/workflows/build-and-deploy.yml` resolve a URL real via
  `gcloud run services describe` no deploy.
- **Correção da nota CAPAG (2026-06-22)**: o "Índice CAPAG Agregado"
  estava sendo calculado como `avg(valor)` dos 3 componentes
  (Endividamento, Poupança Corrente, Liquidez) e exibido com
  `unidade: '%'` — não é a nota oficial do Tesouro Nacional. A nota
  agregada real (`CAPAG - Nota Final`) é categórica (A/B/C/D), `valor` é
  sempre `null` na origem.
  - `silver/capag_agregado.sql` reescrito: seleciona direto `CAPAG - Nota
    Final` (confirmado 1 linha por localidade+ano, sem agregação
    necessária) em vez de fazer média dos outros 3 componentes.
  - `dim_indicadores.sql`: `unidade` volta a `null`; `descricao`
    corrigida.
  - `apps/api/model/views/indicadores.js`: `nota` adicionada aos membros
    expostos de `fact_indicadores`.
  - Frontend: `ValorSerie`/`PontoSerieIndicador` ganham campo `nota`;
    `MetricCard` mostra a nota no lugar do valor numérico quando ela
    existe.
  - Validado contra produção: Salvador (`2927408`) retorna
    `{"valor": null, "nota": "B"}` para o CAPAG.

# Decisões tomadas

- Auth service-to-service via JWT assinado server-side a partir de
  `CUBEJS_API_SECRET` — sem reabrir autenticação de usuário (Firebase) no
  Cube.js por ora.
- Incluir uma dimensão `time` (`data_referencia`) direto em `dimensions`
  (em vez de `timeDimensions`) quebra o driver BigQuery do Cube
  (`Could not cast literal "UTC" to type TIME`) — usado `ano` (number) em
  vez disso, também mais correto já que a granularidade real dos dados é
  sempre anual.
- `primary_key: true` deixa o membro `public: false` por padrão no Cube —
  `indicador_id`/`localidade_id` precisaram de `public: true` explícito em
  `apps/api/model/cubes/{dim_indicadores,dim_localidades}.js` para o
  frontend conseguir filtrar/selecionar por eles diretamente.

# Critérios de aceite

- [x] As 4 rotas (`search`, `nomeados`, `localidade/[municipio_id]`,
      `healthz`) respondem 200 com dados reais do Cube.js (validado via
      `curl` direto em produção).
- [x] `/` (Dashboard): aberto com localidade real (Salvador,
      `municipio_id=2927408`), valores de série batem com a API; CAPAG
      mostra a nota oficial (A/B/C/D), não mais a média sintética.
- [ ] `/indicadores` (`IndicadorSearch`): validar busca por termos reais
      ("mortalidade", "capag") e confirmar lista sem itens
      truncados/mal formatados.
- [ ] `/configuracoes/categorias` (`CategoriasEditor`, via
      `useIndicadorNomes`): confirmar nomes resolvidos pelo Cube.js para
      indicadores já selecionados (cache SWR de 1h — testar também após
      invalidar/recarregar).
- [ ] Testar degradação: Cube.js temporariamente inacessível (secret
      errado ou serviço fora do ar) e confirmar que a UI mostra
      erro/loading gracioso, sem quebrar a página inteira.
- [ ] Conferir visualmente o caso de `serie` vazia (mais provável por
      causa da decisão aberta de `localidade_id` — ver Observações).

# Observações

**Achado real durante a validação visual (cache do browser, não bug)**:
a PWA (`next.config.ts`, `runtimeCaching`) cacheia `/api/indicadores/*`
via `StaleWhileRevalidate` (`maxAgeSeconds: 3600`) — quem já tinha o site
aberto via service worker continuou vendo a resposta de antes da migração
por até 1h. Confirmado via `curl` direto que a API real já estava
correta. Para testar sem esse cache: aba anônima, ou DevTools →
Application → Service Workers → Unregister + Clear storage.

**Achado real e separado (não é cache)**: indicadores `144` e `4030`
(`data/categoriasIndicadores.ts`, subeixo Finanças) não têm nenhum dado,
nem no município — `serie: []` mesmo pedindo direto. Não investigado se
são IDs órfãos ou problema de mapeamento.

**Decisão que ficou aberta nesta fase, e foi resolvida depois**: formato
de `localidade_id` inconsistente entre fontes para estados/país
(`dim_localidades` usava `"BR-SP"`; CAPAG gravava `"SP"`;
`localidades_dropdown.json` usava `" SP"`, com espaço) — fazia a série
histórica de CAPAG vir vazia em nível de estado/país. **Resolvido em
`ISSUE-0008`** (2026-06-22, sessão separada desta fase).

# Log de execução

- 2026-06-22: protocolo de consumo fechado; 3 rotas migradas; acesso
  direto a BigQuery removido do frontend; IAM revogado.
- 2026-06-22: primeira rodada de validação visual real (Salvador, eixo
  Economia & Finanças) — achado de cache de PWA explicado, achado de
  indicadores sem dado registrado (não investigado).
- 2026-06-22: nota CAPAG corrigida (nota oficial em vez de média
  sintética), validado contra produção.
- 2026-06-22: decisão aberta sobre `localidade_id` resolvida em
  `ISSUE-0008` — issue permanece `review` por causa do checklist de
  validação visual ainda pendente (busca, categorias, degradação, série
  vazia).
