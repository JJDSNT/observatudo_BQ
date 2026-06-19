"""Grava cada execução de etapa do pipeline em ops.pipeline_runs."""

import datetime as dt

from google.cloud import bigquery

OPS_DATASET = "ops"
PIPELINE_RUNS_TABLE = "pipeline_runs"


def log_run(
    client: bigquery.Client,
    *,
    run_id: str,
    step: str,
    status: str,
    started_at: float,
    rows_affected: int | None = None,
    error_message: str | None = None,
) -> None:
    table_id = f"{OPS_DATASET}.{PIPELINE_RUNS_TABLE}"
    row = {
        "run_id": run_id,
        "pipeline_step": step,
        "status": status,
        "started_at": dt.datetime.fromtimestamp(
            started_at, tz=dt.timezone.utc
        ).isoformat(),
        "finished_at": dt.datetime.now(tz=dt.timezone.utc).isoformat(),
        "rows_affected": rows_affected,
        "error_message": error_message,
    }
    errors = client.insert_rows_json(table_id, [row])
    if errors:
        raise RuntimeError(f"Falha ao gravar log em {table_id}: {errors}")
