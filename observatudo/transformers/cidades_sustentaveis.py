import pandas as pd
from datetime import datetime, timezone
import os
import json
import logging

from observatudo import config
from observatudo.io_utils import (
    ler_csv,
    salvar_csv,
    upload_to_bucket,
    salvar_cache_json,
    carregar_cache_json,
)
from observatudo.llm import classificar_eixo, check_server
from observatudo.constants import CATEGORIAS_VALIDAS
from observatudo.logger import setup_logger
from tqdm import tqdm

logger = setup_logger(__name__)


def classificar_indicadores_com_llm(df, mapeamento_eixos, categorias_validas):
    agrupado = df.groupby("indicador_id").first()
    novos = {
        cod: row for cod, row in agrupado.iterrows()
        if cod not in mapeamento_eixos
    }
    erros = []

    logger.info(f"🧠 Classificando {len(novos)} indicadores com LLM...")

    for i, (cod, row) in enumerate(tqdm(novos.items(), desc="LLM classificando")):
        texto = f"{row['nome']} - {row.get('descricao', '')}"
        try:
            eixo = classificar_eixo(texto)
            if eixo not in categorias_validas:
                erros.append({
                    "indicador_id": cod,
                    "nome": row["nome"],
                    "descricao": row.get("descricao", ""),
                    "eixo_invalido": eixo
                })
                logger.warning(
                    f"🚫 [{i+1}/{len(novos)}] {cod} - {row['nome']} → Classificação inválida: '{eixo}'"
                )
            else:
                mapeamento_eixos[cod] = eixo
                logger.info(f"✅ [{i+1}/{len(novos)}] {cod} - {row['nome']} → {eixo}")
        except Exception as e:
            logger.error(
                f"⚠️ [{i+1}/{len(novos)}] Erro ao classificar {cod} - {row['nome']}: {e}"
            )

    return mapeamento_eixos, erros

def exibe_estatisticas(df):
    total = len(df)
    com_valor = df["valor"].notna().sum()
    sem_valor = df["valor"].isna().sum()
    logger.info("📊 Estatísticas do pré-processamento:")
    logger.info(f" - Total de registros: {total}")
    logger.info(f" - Com valor numérico: {com_valor}")
    logger.info(f" - Ignorados por valor inválido: {sem_valor}")
    if erros and path_invalidos:
        logger.warning(f"🚫 Foram encontrados {len(erros)} erros na classificação (detalhes salvos em {path_invalidos}).")


def main():
    logger.info(f"📁 Lendo arquivo bruto de indicadores: {os.path.join(config.DADOS_DIR, 'indicadores.csv')}")
    df = ler_csv(os.path.join(config.DADOS_DIR, "indicadores.csv"))

    # Renomeação
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
        "Justificativa": "justificativa",
    }
    df = df.rename(columns=colunas_renomeadas)
    df = df[list(colunas_renomeadas.values())]
    logger.info("✅ Colunas renomeadas e padronizadas.")

    # Classificação com LLM
    if check_server():
        logger.info("🔗 Servidor LLM disponível, carregando cache e iniciando classificação de eixos.")
        mapeamento_eixos = carregar_cache_json(config.MAPA_EIXOS_PATH)
        mapeamento_eixos, erros = classificar_indicadores_com_llm(
            df, mapeamento_eixos, CATEGORIAS_VALIDAS
        )
        salvar_cache_json(mapeamento_eixos, config.MAPA_EIXOS_PATH)
        if erros:
            df_erros = pd.DataFrame(erros)
            salvar_csv(df_erros, config.INVALIDOS_PATH)
            logger.warning(f"🚫 Foram encontrados {len(erros)} erros na classificação (detalhes salvos em {config.INVALIDOS_PATH}).")
        df["eixo_ia"] = df["indicador_id"].map(mapeamento_eixos)
    else:
        logger.warning("⚠️ Recategorização ignorada: servidor Ollama não acessível.")

    # Conversões
    logger.info("🔄 Convertendo campos para tipos adequados...")
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

    # Estatísticas
    exibe_estatisticas(df)

    # Salvar arquivo padronizado localmente
    caminho_limpo = os.path.join(config.DADOS_DIR, "indicadores_padronizados.csv")
    logger.info(f"💾 Salvando CSV limpo em: {caminho_limpo}")
    salvar_csv(df, caminho_limpo)

    # Upload para o GCS
    logger.info("☁️ Realizando upload dos arquivos para o GCS...")
    upload_to_bucket(
        local_path=os.path.join(config.DADOS_DIR, "indicadores.csv"),
        bucket_path="indicadores/brutos/cidades-sustentaveis/indicadores.csv"
    )
    upload_to_bucket(
        local_path=caminho_limpo,
        bucket_path="indicadores/processados/cidades-sustentaveis/indicadores.csv"
    )
    logger.info("✅ Upload concluído com sucesso para o bucket GCS.")


if __name__ == "__main__":
    main()
