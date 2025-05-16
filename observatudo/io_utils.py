import os
import json
import pandas as pd
from google.cloud import storage
from observatudo.constants import BUCKET_NAME


# === Manipulação de CSV ===
def ler_csv(caminho: str) -> pd.DataFrame:
    return pd.read_csv(caminho)


def salvar_csv(df: pd.DataFrame, caminho: str):
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    df.to_csv(caminho, index=False)


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
