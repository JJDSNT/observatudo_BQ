"""
Este script realiza o pré-processamento
da fonte de dados 'Cidades Sustentáveis',
produzindo um arquivo CSV padronizado pronto para ingestão via dbt.

Etapas realizadas:
- Leitura e renomeação de colunas relevantes
- Conversão segura de campo 'valor' para float
- Limpeza de quebras de linha e tipos
- Adição de data de processamento
- (Opcional) Recategorização por LLM local por indicador_id
- Upload para bucket GCS (bruto + processado)

📁 O resultado limpo é salvo localmente em:
    dados/cidades-sustentaveis/indicadores_padronizados.csv

🧠 Caso a recategorização por IA esteja habilitada:
    → Um cache incremental por indicador_id será mantido em:
      dados/cidades-sustentaveis/eixos_llm.json
    → Apenas novos indicadores não presentes nesse cache
      serão enviados ao modelo LLM local para classificação

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
      • IA local durante o pré-processamento (eixo_ia)
      • ou join com tabela auxiliar (indicador_id → eixo_padrao)
  - A normalização permitirá alinhar com o enum Eixos (SAUDE, EDUCACAO, etc.)
"""


import pandas as pd
from google.cloud import storage
import os
from datetime import datetime, timezone
import json
from pathlib import Path
from meu_llm import classificar_eixo, check_server
from tqdm import tqdm


# === CONFIGURAÇÕES ===
CAMINHO_BRUTO = "dados/cidades-sustentaveis/indicadores.csv"
CAMINHO_LIMPO = "dados/cidades-sustentaveis/indicadores_padronizados.csv"
BUCKET_NAME = "observatudo-infra-www-data"
DESTINO_BRUTO = "indicadores/brutos/cidades-sustentaveis/indicadores.csv"
DESTINO_PROCESSADO = (
    "indicadores/processados/cidades-sustentaveis/indicadores.csv"
)

# === CATEGORIAS VÁLIDAS ===
CATEGORIAS_VALIDAS = {
    "Saude",
    "Educacao",
    "Assistencia Social",
    "Seguranca",
    "Meio Ambiente",
    "Urbanismo",
    "Mobilidade Urbana",
    "Economia",
    "Financas Publicas",
    "Governanca",
    "Administracao Publica"
}


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

# === ETAPA 2.5: Recategorização com LLM local ===

CAMINHO_MAPA_EIXOS = "dados/cidades-sustentaveis/eixos_llm.json"
CAMINHO_ERROS_EIXOS = "dados/cidades-sustentaveis/erros_classificacao_llm.csv"

if check_server():
    if Path(CAMINHO_MAPA_EIXOS).exists():
        with open(CAMINHO_MAPA_EIXOS, encoding="utf-8") as f:
            mapeamento_eixos = json.load(f)
    else:
        mapeamento_eixos = {}

    agrupado = df.groupby("indicador_id").first()
    novos = {
        cod: row
        for cod, row in agrupado.iterrows()
        if cod not in mapeamento_eixos
    }

    erros_classificacao = []

    print(f"🧠 Classificando {len(novos)} indicadores com LLM...")

    for i, (cod, row) in enumerate(
        tqdm(
            novos.items(),
            desc="LLM classificando"
        )
    ):

        texto = f"{row['nome']} - {row.get('descricao', '')}"

        try:
            eixo = classificar_eixo(texto).strip()

            if eixo not in CATEGORIAS_VALIDAS:
                print(
                    f"🚫 [{i+1}/{len(novos)}] {cod} - {row['nome']}\n"
                    f"→ Classificação inválida: '{eixo}'"
                )

                erros_classificacao.append(
                    {
                        "indicador_id": cod,
                        "nome": row["nome"],
                        "descricao": row.get("descricao", ""),
                        "eixo_invalido": eixo,
                    }
                )
                continue

            mapeamento_eixos[cod] = eixo
            print(f"✅ [{i+1}/{len(novos)}] {cod} - {row['nome']} → {eixo}")

        except Exception as e:
            print(
                f"⚠️ [{i+1}/{len(novos)}] Erro ao classificar\n"
                f"→ {cod} - {row['nome']}\n"
                f"→ {e}"
            )
            erros_classificacao.append(
                {
                    "indicador_id": cod,
                    "nome": row["nome"],
                    "descricao": row.get("descricao", ""),
                    "erro": str(e),
                }
            )

    df["eixo_ia"] = df["indicador_id"].map(mapeamento_eixos)

    os.makedirs(os.path.dirname(CAMINHO_MAPA_EIXOS), exist_ok=True)
    with open(CAMINHO_MAPA_EIXOS, "w", encoding="utf-8") as f:
        json.dump(mapeamento_eixos, f, ensure_ascii=False, indent=2)

    if erros_classificacao:
        df_erros = pd.DataFrame(erros_classificacao)
        os.makedirs(os.path.dirname(CAMINHO_ERROS_EIXOS), exist_ok=True)
        df_erros.to_csv(CAMINHO_ERROS_EIXOS, index=False)

        msg = (
            f"🚫 Foram encontrados "
            f"{len(erros_classificacao)} erros na classificação."
        )
        print(msg)

        print(f"📄 Detalhes salvos em: {CAMINHO_ERROS_EIXOS}")
    else:
        print("✅ Nenhum erro de classificação encontrado.")

else:
    print("⚠️ Recategorização ignorada: servidor Ollama não acessível.")

# === ETAPA 3: Conversões seguras ===
df["valor_original"] = df["valor"]
df["valor"] = pd.to_numeric(
    df["valor"]
    .astype(str)
    .str.replace(".", "", regex=False)
    .str.replace(",", ".", regex=False),
    errors="coerce"
)

df["justificativa"] = df["justificativa"].fillna("").str.replace("\n", " ")
df["ano"] = pd.to_numeric(df["ano"], errors="coerce").astype("Int64")
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

blob_bruto = bucket.blob(DESTINO_BRUTO)
blob_bruto.upload_from_filename(CAMINHO_BRUTO)

blob_proc = bucket.blob(DESTINO_PROCESSADO)
blob_proc.upload_from_filename(CAMINHO_LIMPO)

print("✅ Upload concluído com sucesso:")
print(f" - Bruto: {DESTINO_BRUTO}")
print(f" - Processado: {DESTINO_PROCESSADO}")
