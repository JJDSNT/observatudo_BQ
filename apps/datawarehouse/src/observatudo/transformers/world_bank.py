# transformers/world_bank.py
# Primeiro transformer internacional do pipeline (ISSUE-0019) — busca os 3
# indicadores clássicos do Gapminder (PIB per capita, expectativa de vida,
# população) na API pública do World Bank, valida cada país contra a
# referência de `observatudo.localidades` e sobe para `raw.raw_world_bank`.
import os
from datetime import datetime, timezone

import pandas as pd
import requests

from observatudo import localidades as loc
from observatudo.io_utils import salvar_csv, upload_csv_to_bigquery, upload_to_bucket
from observatudo.logger import setup_logger

logger = setup_logger(__name__)

API_URL = "https://api.worldbank.org/v2/country/all/indicator/{codigo}"
INDICADORES = ["NY.GDP.PCAP.CD", "SP.DYN.LE00.IN", "SP.POP.TOTL"]
DADOS_DIR = "data/world_bank"


def _buscar_serie(indicador_codigo: str) -> list[dict]:
    resp = requests.get(
        API_URL.format(codigo=indicador_codigo),
        params={"format": "json", "per_page": 20000, "date": "1960:2026"},
        timeout=120,
    )
    resp.raise_for_status()
    _meta, linhas = resp.json()
    return linhas


def _resolver_localidade(codigo_iso: str) -> str | None:
    """`None` para agregados da própria API do World Bank (regiões,
    grupos de renda) — não são países reais, ficam fora de
    `data/world_bank/paises.csv` e por isso o resolver rejeita.
    """
    try:
        return loc.resolver_pais_por_iso(codigo_iso)
    except loc.LocalidadeDesconhecidaError:
        return None


def main():
    registros = []

    for codigo in INDICADORES:
        logger.info(f"📥 Buscando indicador {codigo} no World Bank...")
        linhas = _buscar_serie(codigo)
        ignorados = 0

        for linha in linhas:
            valor = linha["value"]
            if valor is None:
                continue

            localidade_id = _resolver_localidade(linha["country"]["id"])
            if localidade_id is None:
                ignorados += 1
                continue

            registros.append({
                "indicador_id": codigo,
                "localidade_id": localidade_id,
                "ano": int(linha["date"]),
                "valor": float(valor),
            })

        logger.info(
            f"   {codigo}: {len(linhas)} linhas brutas, {ignorados} agregados "
            "descartados."
        )

    df = pd.DataFrame(registros)
    df["data_processamento"] = datetime.now(timezone.utc)
    logger.info(f"✅ {len(df)} registros válidos no total.")

    caminho = os.path.join(DADOS_DIR, "indicadores_padronizados.csv")
    salvar_csv(df, caminho)

    upload_to_bucket(
        local_path=caminho,
        bucket_path="indicadores/processados/world-bank/indicadores.csv",
    )

    upload_csv_to_bigquery(
        csv_path=caminho,
        table_id="observatudo-infra.raw.raw_world_bank",
    )


if __name__ == "__main__":
    main()
