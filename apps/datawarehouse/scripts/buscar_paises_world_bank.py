# scripts/buscar_paises_world_bank.py
# Gera data/world_bank/paises.csv a partir da API de metadados de países do
# World Bank (https://api.worldbank.org/v2/country) — referência estática,
# commitada no repo no mesmo espírito dos CSVs de data/ibge/localidades/,
# regenerada manualmente quando necessário (não faz parte do pipeline
# raw -> silver -> gold, que consome o CSV já gerado via
# observatudo.localidades).
#
# Uso:
#   uv run python scripts/buscar_paises_world_bank.py

import csv

import requests

URL = "https://api.worldbank.org/v2/country"
DESTINO = "data/world_bank/paises.csv"


def buscar_paises() -> list[dict]:
    resp = requests.get(URL, params={"format": "json", "per_page": 400}, timeout=30)
    resp.raise_for_status()
    _meta, paises = resp.json()

    # region.id == "NA" marca os agregados da própria API (ex.: "Africa
    # Eastern and Southern", "World", "High income") — não são países.
    reais = [p for p in paises if p["region"]["id"] != "NA"]

    return [
        {
            "codigo_iso": p["iso2Code"],
            "nome": p["name"],
            "regiao": p["region"]["value"].strip(),
        }
        for p in reais
    ]


def main():
    linhas = buscar_paises()
    print(f"{len(linhas)} países reais (agregados descartados).")

    with open(DESTINO, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["codigo_iso", "nome", "regiao"])
        writer.writeheader()
        writer.writerows(linhas)

    print(f"Salvo em {DESTINO}")


if __name__ == "__main__":
    main()
