import pandas as pd
from google.cloud import bigquery
from datetime import datetime, timezone
import os

# === CONFIG ===
PROJETO = "observatudo-infra"
DATASET = "dados"
TABELA = "localidades"
CAMINHO_DADOS = "../dados/ibge/localidades/"
CAMPO_CAPITAL = "é_capital"

# === LEITURA DOS CSVs ===
pais_df = pd.read_csv(os.path.join(CAMINHO_DADOS, "pais.csv"))
estados_df = pd.read_csv(os.path.join(CAMINHO_DADOS, "estados.csv"))
capitais_df = pd.read_csv(
    os.path.join(CAMINHO_DADOS, "municipios_c_capital.csv")
)

localidades = []

AGORA_UTC = datetime.now(timezone.utc)

# === PAIS ===
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
        "codigo_oficial": row["codigo"],
        "data_inclusao": AGORA_UTC,
    })

# === ESTADOS ===
for _, row in estados_df.iterrows():
    localidades.append({
        "localidade_id": f"BR-{row['SIGLA']}",
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
        "codigo_oficial": row["COD"],
        "data_inclusao": AGORA_UTC,
    })

# === CIDADES ===
for _, row in capitais_df.iterrows():
    estado_row = estados_df[estados_df["COD"] == row["codigo_uf"]].iloc[0]
    estado_sigla = estado_row["SIGLA"]

    localidades.append({
        "localidade_id": str(row["codigo_ibge"]),
        "nome": row["nome"],
        "tipo": "cidade",
        "localidade_pai_id": f"BR-{estado_sigla}",
        "sigla": None,
        "regiao": None,
        CAMPO_CAPITAL: bool(row["capital"]),
        "capital_localidade_id": None,
        "latitude": row["latitude"],
        "longitude": row["longitude"],
        "populacao": None,
        "codigo_oficial": str(row["codigo_ibge"]),
        "data_inclusao": AGORA_UTC,
    })

# === PREENCHER capital_localidade_id ===
# Para estados
for estado_row in [item for item in localidades if item["tipo"] == "estado"]:
    cod_estado = int(estado_row["codigo_oficial"])
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
df["codigo_oficial"] = df["codigo_oficial"].astype(str)
job = client.load_table_from_dataframe(df, table_ref)
job.result()
print("Carga de localidades concluída com sucesso.")
