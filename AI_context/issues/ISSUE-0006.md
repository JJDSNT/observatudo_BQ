---
id: ISSUE-0006
title: Fase 5 — Scaffold de apps/api (Cube.js) + Terraform + CI/CD
status: consolidated
priority: high
type: feature
owner: agent
created_at: 2026-06-22
updated_at: 2026-06-22
tags:
  - api
  - cubejs
  - infra
  - bigquery
related_files:
  - apps/api/cube.js
  - apps/api/model/cubes/dim_indicadores.js
  - apps/api/model/cubes/dim_localidades.js
  - apps/api/model/cubes/fact_indicadores.js
  - apps/api/model/views/indicadores.js
  - infra/cubejs.tf
  - .github/workflows/build-and-deploy-cubejs.yml
---

# Resumo

`apps/api` criado como app real de Cube.js sobre o dataset `gold`,
deployado self-hosted via Cloud Run com CI/CD próprio — substituindo o
acesso direto do frontend ao BigQuery por um modelo semântico único e
reutilizável.

# Problema

O frontend acessava BigQuery diretamente (`src/lib/analytics/client.ts`),
sem camada semântica — cada rota reimplementava sua própria query SQL,
sem reuso de joins/medidas entre rotas, e expondo a estrutura do `gold`
diretamente ao código do frontend.

# Objetivo

`apps/api` como app real (schema versionado, não placeholder), só leitura
sobre `gold`, deployado em produção com CI/CD, antes de migrar qualquer
rota do frontend para consumi-lo (isso ficou para a Fase 6,
`ISSUE-0007`).

# O que foi feito

- `package.json` (`@cubejs-backend/server` + `@cubejs-backend/bigquery-driver`),
  `cube.js`, `model/cubes/{dim_indicadores,dim_localidades,fact_indicadores}.js`
  (joins `fact_indicadores` → `dim_indicadores`/`dim_localidades`),
  `model/views/indicadores.js` (view denormalizada candidata a substituir
  `src/app/api/indicadores/*`), `Dockerfile`, `.env.example`.
- Terraform (`infra/cubejs.tf`): SA `sa-observatudo-cubejs` (IAM
  `dataViewer` só em `gold` + `bigquery.jobUser` +
  `storage.objectAdmin` no bucket `*-www-data` para
  `CUBEJS_DB_EXPORT_BUCKET`), serviço Cloud Run `cubejs-observatudo`, IAM
  `run.invoker` para `allUsers` (mesmo padrão do frontend — ver decisão
  aberta em `ISSUE-0010`).
- CI/CD (`.github/workflows/build-and-deploy-cubejs.yml`, espelha o do
  frontend): build de `apps/api/Dockerfile`, push para
  `gcr.io/observatudo-infra/observatudo-cubejs`, `gcloud run deploy` a
  cada push em `main` que toque `apps/api/**`. `CUBEJS_API_SECRET`
  configurado como secret do GitHub Actions, passado via
  `--set-env-vars` (não usa Secret Manager do GCP).
- `gold.dim_indicadores` ganhou `unidade`/`fonte`/`periodicidade`
  (colunas pedidas pelo frontend via `listarIndicadores()`, nunca tinham
  sido populadas no modelo dimensional): `fonte` e `periodicidade` vêm de
  dado real (já existiam em `silver.cidades_sustentaveis`/
  `silver.capag_agregado`, só não eram propagadas); `periodicidade` é
  `'anual'` para as duas fontes — verificado estruturalmente que
  `(indicador_id, localidade, ano)` é sempre único em
  `cidades-sustentaveis/indicadores_padronizados.csv` (38495 linhas, 0
  duplicatas). `unidade` ficou `null` para os indicadores do Cidades
  Sustentáveis (sem essa informação em nenhuma fonte original — ver
  decisão aberta em `ISSUE-0014`).

# Decisões tomadas

- Cube.js self-hosted via Cloud Run (não Cube Cloud), com possibilidade
  de usar o bucket GCS existente como apoio (export/pré-agregação).
- Cube.js é escopo somente leitura/analítico sobre `gold`; o dataset `ops`
  não é exposto via Cube.js (tem API própria, FastAPI, em
  `apps/datawarehouse/src/observatudo/api/`).

# Critérios de aceite

- [x] `cubejs-dev-server` local sobe.
- [x] `/cubejs-api/v1/meta` compila os 3 cubos + view.
- [x] Query real (`count`/`valor_medio` por `nome`/`unidade`) retorna
      dados reais do BigQuery via ADC.
- [x] `terraform plan` mostrou só os recursos novos do Cube.js (sem
      destruir nada existente); `apply` aplicado.
- [x] CI/CD publica a imagem real (substituindo o placeholder
      `cubejs/cube:latest`) a cada push relevante em `main`.

# Observações

Achado durante a validação (pré-existente, não introduzido nesta fase):
os 4 componentes individuais do CAPAG existem em `fact_indicadores` mas
não têm linha em `dim_indicadores` (só o índice agregado `capag` tem) —
aparecem como join órfão. Ver `ISSUE-0011`.

Cuidado registrado: `var.cubejs_image_url` tinha um default público
(`cubejs/cube:latest`) que, se aplicado depois do CI já ter publicado a
imagem real, reverteria o deploy — default removido (var agora
obrigatória, mesmo padrão de `var.image_url`).

# Log de execução

- 2026-06-22: `apps/api` criado e validado localmente.
- 2026-06-22: Terraform do Cube.js aplicado em produção.
- 2026-06-22: CI/CD do Cube.js criado, imagem real publicada.
- 2026-06-22: `gold.dim_indicadores` ganhou `unidade`/`fonte`/
  `periodicidade`, pipeline gold reexecutado e validado via query real.
