"""Executa uma etapa do pipeline contra o BigQuery.

Lê o .sql da etapa, monta `CREATE OR REPLACE TABLE/VIEW ... AS (<select>)`
(com PARTITION BY/CLUSTER BY quando configurado — equivalente ao bloco
`config()` do dbt) e executa. Substitui o `dbt run`.
"""

import time
import uuid
from pathlib import Path

from google.cloud import bigquery

from observatudo.pipeline.ops_logger import log_run
from observatudo.pipeline.steps import Step

# apps/datawarehouse/src/observatudo/pipeline/runner.py -> apps/datawarehouse/sql
SQL_DIR = Path(__file__).resolve().parents[3] / "sql"


def build_ddl(step: Step, select_sql: str) -> str:
    object_type = "VIEW" if step.materialization == "view" else "TABLE"
    target = f"`{step.dataset}.{step.table}`"

    clauses = []
    if step.partition_by:
        clauses.append(f"PARTITION BY {step.partition_by}")
    if step.cluster_by:
        clauses.append(f"CLUSTER BY {', '.join(step.cluster_by)}")
    suffix = (" " + " ".join(clauses)) if clauses else ""

    return f"CREATE OR REPLACE {object_type} {target}{suffix} AS (\n{select_sql}\n)"


def run_step(client: bigquery.Client, step: Step) -> int | None:
    select_sql = (SQL_DIR / step.sql_file).read_text(encoding="utf-8")
    ddl = build_ddl(step, select_sql)

    run_id = str(uuid.uuid4())
    started_at = time.time()
    try:
        query_job = client.query(ddl)
        query_job.result()
        rows_affected = query_job.num_dml_affected_rows
        log_run(
            client,
            run_id=run_id,
            step=step.name,
            status="success",
            started_at=started_at,
            rows_affected=rows_affected,
        )
        return rows_affected
    except Exception as exc:
        log_run(
            client,
            run_id=run_id,
            step=step.name,
            status="error",
            started_at=started_at,
            error_message=str(exc),
        )
        raise
