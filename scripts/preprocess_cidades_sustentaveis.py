import pandas as pd
from google.cloud import storage
import os
from datetime import datetime, timezone

# === CONFIGURAÇÕES ===
CAMINHO_BRUTO = "dados/cidades-sustentaveis/indicadores.csv"
CAMINHO_LIMPO = "dados/cidades-sustentaveis/indicadores_padronizados.csv"
BUCKET_NAME = "observatudo-infra-www-data"
DESTINO_BRUTO = "indicadores/brutos/cidades-sustentaveis/indicadores.csv"
DESTINO_PROCESSADO = (
    "indicadores/processados/cidades-sustentaveis/indicadores.csv"
)

# === ETAPA 1: Leitura do CSV bruto ===
df = pd.read_csv(CAMINHO_BRUTO)

# === ETAPA 2: Limpeza inicial e padronização de colunas ===
df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]

# (exemplo de filtro inicial — adaptável)
colunas_obrigatorias = ["id", "nome"]

df = df[[
    col for col in df.columns
    if col in colunas_obrigatorias
    or "categoria" in col
    or "fonte" in col
]]

df["data_processamento"] = datetime.now(timezone.utc)

# === ETAPA 3: Salvar CSV limpo localmente ===
os.makedirs(os.path.dirname(CAMINHO_LIMPO), exist_ok=True)
df.to_csv(CAMINHO_LIMPO, index=False)

# === ETAPA 4: Upload dos arquivos para o bucket ===
client = storage.Client()
bucket = client.bucket(BUCKET_NAME)

# Upload do bruto
blob_bruto = bucket.blob(DESTINO_BRUTO)
blob_bruto.upload_from_filename(CAMINHO_BRUTO)

# Upload do processado
blob_proc = bucket.blob(DESTINO_PROCESSADO)
blob_proc.upload_from_filename(CAMINHO_LIMPO)

print("✅ Upload concluído com sucesso:")
print(f" - Bruto: {DESTINO_BRUTO}")
print(f" - Processado: {DESTINO_PROCESSADO}")
