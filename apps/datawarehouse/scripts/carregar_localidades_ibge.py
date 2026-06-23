import sys
from pathlib import Path

import pandas as pd
from google.cloud import bigquery
from datetime import datetime, timezone
import os

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
from observatudo import localidades as loc  # noqa: E402

# === CONFIG ===
PROJETO = "observatudo-infra"
DATASET = "gold"
TABELA = "dim_localidades"
CAMINHO_DADOS = "data/ibge/localidades/"
CAMINHO_MUNDO = "data/world_bank/paises.csv"
CAMPO_CAPITAL = "é_capital"

# === LEITURA DOS CSVs ===
pais_df = pd.read_csv(os.path.join(CAMINHO_DADOS, "pais.csv"))
estados_df = pd.read_csv(os.path.join(CAMINHO_DADOS, "estados.csv"))
capitais_df = pd.read_csv(
    os.path.join(CAMINHO_DADOS, "municipios_c_capital.csv")
)

# A fonte do IBGE traz espaço em branco em `SIGLA` (ex.: " SP") — sem o
# strip, contamina sigla/localidade_id/localidade_pai_id de toda a tabela.
estados_df["SIGLA"] = estados_df["SIGLA"].str.strip()
pais_df["sigla"] = pais_df["sigla"].str.strip()

localidades = []

AGORA_UTC = datetime.now(timezone.utc)

# === PAIS ===
# `localidade_id` é um id interno, não a chave de uma autoridade externa.
# Para país ele coincide com o código ISO 3166-1 alpha-2 (`codigo_iso`);
# não há código IBGE de país, por isso `codigo_ibge` fica nulo.
for _, row in pais_df.iterrows():
    localidades.append({
        "localidade_id": row["sigla"],
        "nome": row["nome"],
        "tipo": "pais",
        "localidade_pai_id": None,
        "sigla": row["sigla"],
        "regiao": None,
        CAMPO_CAPITAL: None,
        "capital_localidade_id": None,
        "latitude": row.get("latitude"),
        "longitude": row.get("longitude"),
        "populacao": row.get("populacao"),
        "codigo_ibge": None,
        "codigo_iso": row["sigla"],
        "data_inclusao": AGORA_UTC,
    })

# === PAÍSES (mundo, World Bank) ===
# `pais.csv` (IBGE) só cobre o Brasil. Os demais países vêm da referência
# `data/world_bank/paises.csv` (gerada por
# `scripts/buscar_paises_world_bank.py`); o Brasil é pulado aqui pra não
# duplicar a linha acima, que já tem capital/latitude/longitude
# resolvidos.
# keep_default_na=False: o ISO 3166-1 alpha-2 da Namíbia é literalmente
# "NA" — sem isso, o pandas interpreta a sigla como valor nulo.
mundo_df = pd.read_csv(CAMINHO_MUNDO, keep_default_na=False)
paises_ja_carregados = set(pais_df["sigla"])

for _, row in mundo_df.iterrows():
    if row["codigo_iso"] in paises_ja_carregados:
        continue
    localidade_id = loc.resolver_pais_por_iso(row["codigo_iso"])
    localidades.append({
        "localidade_id": localidade_id,
        "nome": row["nome"],
        "tipo": "pais",
        "localidade_pai_id": None,
        "sigla": localidade_id,
        "regiao": row["regiao"],
        CAMPO_CAPITAL: None,
        "capital_localidade_id": None,
        "latitude": None,
        "longitude": None,
        "populacao": None,
        "codigo_ibge": None,
        "codigo_iso": localidade_id,
        "data_inclusao": AGORA_UTC,
    })

# === ESTADOS ===
# `localidade_id` (`"BR-SP"`) coincide aqui com o ISO 3166-2; o código
# IBGE de UF (2 dígitos) fica em `codigo_ibge`, separado.
for _, row in estados_df.iterrows():
    localidade_id = loc.resolver_estado_por_sigla(row["SIGLA"])
    localidades.append({
        "localidade_id": localidade_id,
        "nome": row["NOME"],
        "tipo": "estado",
        "localidade_pai_id": "BR",
        "sigla": row["SIGLA"],
        "regiao": None,
        CAMPO_CAPITAL: False,
        "capital_localidade_id": None,
        "latitude": None,
        "longitude": None,
        "populacao": None,
        "codigo_ibge": str(row["COD"]),
        "codigo_iso": localidade_id,
        "data_inclusao": AGORA_UTC,
    })

# === CIDADES ===
# Município não tem código ISO de subdivisão-de-subdivisão; só
# `codigo_ibge` se aplica. `localidade_pai_id` é resolvido pelo mesmo
# cruzamento codigo_uf -> estado usado em todo o resto do script.
for _, row in capitais_df.iterrows():
    codigo_ibge_municipio = loc.resolver_municipio_por_codigo_ibge(
        row["codigo_ibge"]
    )
    localidades.append({
        "localidade_id": codigo_ibge_municipio,
        "nome": row["nome"],
        "tipo": "cidade",
        "localidade_pai_id": loc.resolver_estado_de_municipio(row["codigo_uf"]),
        "sigla": None,
        "regiao": None,
        CAMPO_CAPITAL: bool(row["capital"]),
        "capital_localidade_id": None,
        "latitude": row["latitude"],
        "longitude": row["longitude"],
        "populacao": None,
        "codigo_ibge": codigo_ibge_municipio,
        "codigo_iso": None,
        "data_inclusao": AGORA_UTC,
    })

# === PREENCHER capital_localidade_id ===
# Para estados
for estado_row in [item for item in localidades if item["tipo"] == "estado"]:
    cod_estado = int(estado_row["codigo_ibge"])
    capital = capitais_df[
        (capitais_df["codigo_uf"] == cod_estado) &
        (capitais_df["capital"] == 1)
    ]
    if not capital.empty:
        codigo_capital = str(capital.iloc[0]["codigo_ibge"])
        estado_row["capital_localidade_id"] = codigo_capital

# Para o Brasil
brasil = next(
    (item for item in localidades if item["localidade_id"] == "BR"), None
)
capital_brasil = capitais_df[capitais_df["nome"] == "Brasília"]
if brasil and not capital_brasil.empty:
    codigo_capital_brasil = str(capital_brasil.iloc[0]["codigo_ibge"])
    brasil["capital_localidade_id"] = codigo_capital_brasil

# === ENVIO AO BIGQUERY ===
df = pd.DataFrame(localidades)
client = bigquery.Client()
table_ref = f"{PROJETO}.{DATASET}.{TABELA}"

print(f"Enviando {len(df)} registros para {table_ref}...")
job = client.load_table_from_dataframe(
    df,
    table_ref,
    job_config=bigquery.LoadJobConfig(write_disposition="WRITE_TRUNCATE"),
)
job.result()
print("Carga de localidades concluída com sucesso.")
