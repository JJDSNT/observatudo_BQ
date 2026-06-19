from fastapi import APIRouter
from google.cloud import bigquery

router = APIRouter(prefix="/pipelines", tags=["pipelines"])


@router.get("/")
def list_pipelines(limit: int = 20):
    """Últimas execuções do pipeline, lidas de ops.pipeline_runs."""
    client = bigquery.Client()
    query = """
        select run_id, pipeline_step, status, started_at, finished_at,
               rows_affected, error_message
        from `ops.pipeline_runs`
        order by started_at desc
        limit @limit
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[bigquery.ScalarQueryParameter("limit", "INT64", limit)]
    )
    rows = client.query(query, job_config=job_config).result()
    return [dict(row) for row in rows]
