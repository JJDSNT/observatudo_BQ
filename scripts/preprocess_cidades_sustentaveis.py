"""
Este script realiza o pré-processamento
da fonte de dados 'Cidades Sustentáveis',
produzindo um arquivo CSV padronizado pronto para ingestão via dbt.

Etapas realizadas:
- Leitura e renomeação de colunas relevantes
- Conversão segura de campo 'valor' para float
- Limpeza de quebras de linha e tipos
- Adição de data de processamento
- Upload para bucket GCS (bruto + processado)

PRÓXIMOS PASSOS (fora do escopo deste script):

→ No dbt:
  - Criação do modelo stg_indicadores__cidades_sustentaveis
  - Aplicação de CASTs, filtros, testes de qualidade
    (not null, accepted_values, etc.)
  - Exclusão de registros inválidos ou incompletos
  - Preparação do modelo dim_indicadores com enriquecimentos

→ Recategorização dos eixos:
  - O campo 'eixo' é mantido como informado pela fonte
  - A categorização final será feita por:
      • IA supervisionada/classificador textual
      • ou join com tabela auxiliar (indicador_id → eixo_padrao)
  - A normalização permitirá alinhar com o enum Eixos (SAUDE, EDUCACAO, etc.)

"""

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

# === ETAPA 2: Renomear colunas relevantes ===
colunas_renomeadas = {
    "Código IBGE": "codigo_ibge",
    "Nome da cidade": "nome_cidade",
    "UF": "uf",
    "Estado Nome": "estado_nome",
    "Eixo": "eixo",
    "ID Indicador": "indicador_id",
    "Nome do indicador": "nome",
    "Formula do indicador": "formula",
    "Meta ODS": "meta_ods",
    "Número ODS": "numero_ods",
    "Nome do ODS": "nome_ods",
    "Descrição do indicador": "descricao",
    "Ano de Preenchimento": "ano",
    "Valor": "valor",
    "Justificativa": "justificativa"
}

df = df.rename(columns=colunas_renomeadas)
df = df[list(colunas_renomeadas.values())]

# === ETAPA 3: Conversões seguras ===

# → valor: texto com vírgula → float (ou NaN se não for número)
df["valor_original"] = df["valor"]  # backup
df["valor"] = pd.to_numeric(
    df["valor"]
    .astype(str)
    .str.replace(".", "", regex=False)
    .str.replace(",", ".", regex=False),
    errors="coerce"
)

# → justificativa: remover quebras de linha
df["justificativa"] = df["justificativa"].fillna("").str.replace("\n", " ")

# → ano: transformar em inteiro seguro
df["ano"] = pd.to_numeric(df["ano"], errors="coerce").astype("Int64")

# → data de processamento
df["data_processamento"] = datetime.now(timezone.utc)

# === ETAPA 4: Estatísticas de qualidade ===
total = len(df)
com_valor = df["valor"].notna().sum()
sem_valor = df["valor"].isna().sum()

print("📊 Estatísticas do pré-processamento:")
print(f" - Total de registros: {total}")
print(f" - Registros com valor numérico: {com_valor}")
print(f" - Registros ignorados por valor inválido: {sem_valor}")

# === ETAPA 5: Salvar CSV limpo localmente ===
os.makedirs(os.path.dirname(CAMINHO_LIMPO), exist_ok=True)
df.to_csv(CAMINHO_LIMPO, index=False)

# === ETAPA 6: Upload dos arquivos para o bucket ===
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
