import os
import json
import pandas as pd
from google.cloud import storage
from observatudo.config import BUCKET_NAME
from google.cloud import bigquery

# === Manipulação de CSV ===


def ler_csv(caminho: str) -> pd.DataFrame:
    return pd.read_csv(caminho)


def salvar_csv(df: pd.DataFrame, caminho: str):
    import csv
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    # Trata possíveis quebras de linha em todas as colunas de texto
    for col in df.select_dtypes(include="object").columns:
        df[col] = df[col].astype(str).str.replace('\r', ' ').str.replace('\n', ' ')
    # Salva com quoting e escaping universal
    df.to_csv(
        caminho,
        index=False,
        encoding="utf-8",
        sep=",",
        quoting=csv.QUOTE_ALL,
        quotechar='"',
        escapechar="\\"
    )


def upload_csv_to_bigquery(csv_path: str, table_id: str, autodetect: bool = True, replace: bool = True):
    """
    Faz upload de um arquivo CSV para uma tabela do BigQuery.

    Args:
        csv_path (str): Caminho para o arquivo CSV.
        table_id (str): Nome completo da tabela no formato 'project.dataset.table'.
        autodetect (bool): Se True, autodetecta o schema.
        replace (bool): Se True, sobrescreve a tabela. Se False, faz append.
    """
    client = bigquery.Client()
    job_config = bigquery.LoadJobConfig(
        source_format=bigquery.SourceFormat.CSV,
        skip_leading_rows=1,
        autodetect=autodetect,
        write_disposition="WRITE_TRUNCATE" if replace else "WRITE_APPEND"
    )
    with open(csv_path, "rb") as source_file:
        load_job = client.load_table_from_file(
            source_file, table_id, job_config=job_config
        )
    load_job.result()
    print(f"✅ CSV carregado para {table_id} no BigQuery!")


# === Manipulação de JSON ===
def carregar_cache_json(caminho: str) -> dict:
    if os.path.exists(caminho):
        with open(caminho, encoding="utf-8") as f:
            return json.load(f)
    return {}


def salvar_cache_json(objeto: dict, caminho: str):
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    with open(caminho, "w", encoding="utf-8") as f:
        json.dump(objeto, f, ensure_ascii=False, indent=2)


# === Upload para GCS ===
def upload_to_bucket(local_path: str, bucket_path: str):
    client = storage.Client()
    bucket = client.bucket(BUCKET_NAME)
    blob = bucket.blob(bucket_path)
    blob.upload_from_filename(local_path)
    print(f"✅ Upload concluído → {bucket_path}")


# === Download do GCS ===
def download_from_bucket(bucket_path: str, local_path: str):
    client = storage.Client()
    bucket = client.bucket(BUCKET_NAME)
    blob = bucket.blob(bucket_path)
    blob.download_to_filename(local_path)
    print(f"⬇️ Download concluído → {local_path}")
