---
id: ISSUE-0003
title: Fase 3 — Camadas BigQuery raw/silver/gold/ops + remover dbt
status: consolidated
priority: critical
type: refactor
owner: agent
created_at: 2026-06-19
updated_at: 2026-06-22
tags:
  - dw
  - bigquery
  - infra
  - refactor
related_files:
  - infra/bigquery.tf
  - infra/iam.tf
  - apps/datawarehouse/sql/silver
  - apps/datawarehouse/sql/gold
  - apps/datawarehouse/src/observatudo/pipeline/steps.py
  - apps/datawarehouse/src/observatudo/pipeline/runner.py
  - apps/datawarehouse/src/observatudo/pipeline/ops_logger.py
  - apps/datawarehouse/scripts/run_pipeline.py
---

# Resumo

Fase única que funde o que originalmente eram duas fases separadas
("remover dbt" e "reorganizar datasets BigQuery"), depois de mapear que na
prática eram a mesma mudança: os modelos dbt (`staging`/`intermediate`/
`dims`/`facts`) migraram para SQL plano organizado por camada do medallion
architecture (`raw`/`silver`/`gold`/`ops`), com um runner Python
substituindo `dbt run`.

# Problema

dbt era desproporcional ao tamanho real dos modelos (`stg_capag`,
`stg_cidades_sustentaveis`, `int_capag`, `dim_indicadores`,
`fact_indicadores` — poucos modelos, pouca complexidade de DAG) frente ao
custo de manter mais uma ferramenta no pipeline. Além disso, o dataset
único `dados` não separava fisicamente as camadas, então a fronteira de
acesso do Cube.js (só deveria ler o modelo final) dependia de convenção,
não de IAM real.

# Objetivo

Quatro datasets BigQuery, um por camada (`raw`, `silver`, `gold`, `ops`),
com IAM real garantindo que só `gold` é exposto a consumidores externos
(Cube.js); pipeline `raw → silver → gold` em SQL simples + runner Python,
sem dbt.

# O que foi feito

- `infra/bigquery.tf` reescrito: datasets `raw`/`silver`/`gold`/`ops`
  criados; `dim_localidades` movida para `gold`; tabela
  `ops.pipeline_runs` criada com schema (run_id, pipeline_step, status,
  started_at, finished_at, rows_affected, error_message).
- `infra/iam.tf` reescrito: SA `www_app` só lê `gold`; SA `dbt`
  substituída por SA `pipeline` (`sa-observatudo-pipeline`) com
  `dataEditor` nos quatro datasets + `bigquery.jobUser`.
  `infra/variables.tf` (`bigquery_dataset_id` default `"dados"` →
  `"gold"`) e `infra/outputs.tf` (`dbt_sa_email` → `pipeline_sa_email`)
  ajustados.
- Modelos dbt migrados para SQL plano em
  `apps/datawarehouse/sql/{silver,gold}/*.sql` (sem Jinja/`ref()`/
  `config()`), lendo de `raw.*`/`silver.*` com nomes totalmente
  qualificados.
- `apps/datawarehouse/src/observatudo/pipeline/` criado: `steps.py`
  (catálogo declarativo das etapas), `runner.py` (monta o DDL `CREATE OR
  REPLACE TABLE/VIEW ... AS (<sql>)`, executa via
  `bigquery.Client().query()`, registra cada execução), `ops_logger.py`
  (grava em `ops.pipeline_runs` via `insert_rows_json`).
  `scripts/run_pipeline.py` é o novo entrypoint (substitui `dbt run`),
  com `--only {silver,gold}`.
- `GET /pipelines/` (antes 501) implementado de fato, lendo
  `ops.pipeline_runs`.
- Tabelas `raw_capag`/`raw_cidades_sustentaveis` apontadas para o dataset
  `raw`; `dim_localidades` apontada para `gold`.
- `dbt/` (18 arquivos rastreados) e o `.venv` órfão da raiz removidos.
- `.github/workflows/build-and-deploy.yml`: env var de deploy
  `BIGQUERY_DATASET_ID` atualizada de `dados` para `gold`.
- `README.md` raiz (estava desatualizado desde antes da Fase 1) reescrito
  do zero para refletir a estrutura monorepo + camadas BigQuery atuais.
- (2026-06-22, achado tardio) SA órfã `sa-observatudo-dbt` — verificado via
  API do GCP que não tinha referência em nenhum dataset BigQuery
  (`raw`/`silver`/`gold`/`ops`) nem no bucket `*-www-data`; só restava o
  binding de projeto `roles/bigquery.jobUser` e 2 chaves de acesso ainda
  válidas (uma sem expiração, de 2025-05-17). Excluída a service account e
  removido o binding da política IAM do projeto.

# Decisões tomadas

- Datasets separados por camada (`raw`/`silver`/`gold`/`ops`), não prefixo
  de nome de tabela dentro de um dataset só — para que a fronteira de
  acesso do Cube.js (só `gold`) seja garantida por IAM real.
- `PARTITION BY`/`CLUSTER BY` vivem no runner Python
  (`Step.partition_by`/`cluster_by`), não no SQL — equivalente ao
  `config()` do dbt, mas explícito no catálogo de steps.

# Critérios de aceite

- [x] `uv run pytest` (3 testes do runner, `build_ddl` para os casos
      table/view/partition+cluster).
- [x] `uv run ruff check .` limpo.
- [x] `terraform validate` ok.
- [x] `terraform apply` real aplicado (bloqueado por um tempo por
      credenciais expiradas do backend remoto — ver `ISSUE-0005`; aplicado
      de fato depois da recuperação do state).
- [x] SA órfã `sa-observatudo-dbt` removida (2026-06-22).

# Observações

Branch de trabalho: `refactor/03-bigquery-layers-remove-dbt`.
O design desta fase (quatro datasets em camadas, em vez de "dois
datasets" `core`+`ops` considerado inicialmente) foi fechado em
2026-06-19, depois de mapear exatamente o que cada modelo dbt fazia
(`stg_capag`/`stg_cidades_sustentaveis` = silver; `int_capag` = silver
agregado; `dim_indicadores`/`fact_indicadores` = gold). `core` foi
renomeado para `gold` em toda a documentação. Ver `docs/architecture.md`
seção 2 e `docs/monorepo-structure.md`.

# Log de execução

- 2026-06-19: design das 4 camadas fechado.
- 2026-06-19: fase implementada e validada (testes, lint, terraform
  validate); `terraform apply` real ficou bloqueado por credenciais —
  resolvido junto do incidente de perda do state (`ISSUE-0005`).
- 2026-06-22: SA órfã `sa-observatudo-dbt` excluída.
