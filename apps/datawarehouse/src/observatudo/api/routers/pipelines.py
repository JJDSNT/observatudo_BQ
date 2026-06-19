from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/pipelines", tags=["pipelines"])


@router.get("/")
def list_pipelines():
    # TODO: ler do dataset `ops` quando ele existir (status/freshness/linhagem).
    raise HTTPException(status_code=501, detail="ops dataset não implementado ainda")
