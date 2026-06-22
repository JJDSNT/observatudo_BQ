# Fase 3 — Camadas BigQuery raw/silver/gold/ops + remover dbt

dbt removido; modelos migrados para SQL plano organizado em 4 datasets
BigQuery por camada do medallion architecture (`raw`/`silver`/`gold`/
`ops`), com um runner Python substituindo `dbt run`. Issue promovida —
log de execução completo recuperável via
`git log -p -- AI_context/issues/ISSUE-0003.md`.

# Motivação

dbt era desproporcional ao tamanho real dos modelos existentes. O dataset
único `dados` também não garantia, via IAM, que só o modelo final fosse
exposto a consumidores externos (Cube.js, fase seguinte).

# Solução adotada

`infra/bigquery.tf` reescrito com 4 datasets + IAM real (SA `pipeline`
escreve nos 4, `www_app` só lê `gold`); modelos dbt convertidos para
`apps/datawarehouse/sql/{silver,gold}/*.sql` sem Jinja; `pipeline/`
(`steps.py`/`runner.py`/`ops_logger.py`) e `scripts/run_pipeline.py`
substituem `dbt run`, registrando cada execução em `ops.pipeline_runs`;
`dbt/` e o `.venv` órfão removidos.

# Arquivos alterados

`infra/bigquery.tf`, `infra/iam.tf`, `infra/variables.tf`,
`infra/outputs.tf`, `apps/datawarehouse/sql/{silver,gold}/*.sql`,
`apps/datawarehouse/src/observatudo/pipeline/*`,
`apps/datawarehouse/scripts/run_pipeline.py`, `README.md` (raiz).
Removidos: `dbt/` (18 arquivos), `.venv` órfão da raiz, SA
`sa-observatudo-dbt` (excluída em 2026-06-22, depois de confirmado sem
referência real em nenhum dataset/bucket).

# Impacto arquitetural

Fixa a fronteira de acesso do Cube.js (só `gold`) via IAM real, não
convenção — decisão estrutural que toda fase seguinte (Cube.js, frontend)
depende.

# Documentações atualizadas

`docs/architecture.md` (seção 2), `docs/monorepo-structure.md`.

# Próximos passos

Nenhum — fase concluída, testada (`pytest`, `ruff`, `terraform validate`)
e aplicada de verdade em produção (depois da recuperação de state em
`ISSUE-0005`).
