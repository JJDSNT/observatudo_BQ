"""API de metadados do DW (dataset `ops`).

Escopo inicial é só leitura. Ver docs/architecture.md (seção 3.1) e
docs/monorepo-structure.md.
"""

from fastapi import FastAPI

from observatudo.api.routers import pipelines

app = FastAPI(title="Observatudo DW Ops API")
app.include_router(pipelines.router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
