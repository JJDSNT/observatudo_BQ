# src/observatudo/transformers/capag.py
import pandas as pd
from pathlib import Path
from datetime import datetime, timezone

from observatudo.llm import inferir_direcionalidade, check_server
from observatudo.io_utils import (
    salvar_cache_json,
    carregar_cache_json,
    salvar_csv,
    upload_to_bucket,
    upload_csv_to_bigquery,
)
from observatudo.logger import setup_logger
from observatudo import config

logger = setup_logger(__name__)

FONTE_NOME = "Tesouro Nacional"
FONTE_URL = (
    "https://www.tesourotransparente.gov.br/temas/"
    "capacidade-de-pagamento-capag"
)


def load_capag_estados(path: Path) -> pd.DataFrame:
    df = pd.read_excel(path)
    df = df.rename(columns={
        "UF": "localidade_id",
        "IND1": "valor_endividamento",
        "NOTA1": "nota_endividamento",
        "IND2": "valor_poupanca",
        "NOTA2": "nota_poupanca",
        "IND3": "valor_liquidez",
        "NOTA3": "nota_liquidez",
        "CAPAG": "nota_final"
    })
    df["tipo_localidade"] = "estado"
    df["ano_base"] = 2022
    return df


def load_capag_municipios(path: Path) -> pd.DataFrame:
    df = pd.read_excel(path)
    df = df.rename(columns={
        "Cod.IBGE": "localidade_id",
        "Indicador_1": "valor_endividamento",
        "Nota_1": "nota_endividamento",
        "Indicador_2": "valor_poupanca",
        "Nota_2": "nota_poupanca",
        "Indicador_3": "valor_liquidez",
        "Nota_3": "nota_liquidez",
        "CAPAG_Oficial": "nota_final"
    })
    df["tipo_localidade"] = "municipio"
    df["ano_base"] = 2022
    return df


def preprocess(df: pd.DataFrame) -> pd.DataFrame:
    registros = []
    agora = datetime.now(timezone.utc)
    for _, row in df.iterrows():
        for indicador, valor, nota in [
            ("CAPAG - Endividamento", row.valor_endividamento, row.nota_endividamento),
            ("CAPAG - Poupança Corrente", row.valor_poupanca, row.nota_poupanca),
            ("CAPAG - Liquidez", row.valor_liquidez, row.nota_liquidez),
            ("CAPAG - Nota Final", None, row.nota_final)
        ]:
            esfera = "estadual" if row.tipo_localidade == "estado" else "municipal"
            registros.append({
                "indicador_id": indicador,
                "localidade_id": row.localidade_id,
                "ano": row.ano_base,
                "valor": valor,
                "justificativa": None,
                "data_insercao": agora,
                "data_referencia": f"{row.ano_base}-01-01",
                "fonte": FONTE_NOME,
                "url_fonte": FONTE_URL,
                "metodologia_calculo": None,
                "data_coleta": None,
                "confiabilidade": None,
                "usuario_insercao": None,
                "processo_etl": "preprocess_capag",
                "versao_metodologia": None,
                "flags": None,
                "nota": nota,
                "esfera_poder": esfera,
                "metadados": {
                    "nota": nota,
                    "frequencia": "anual",
                    "esferaDePoder": esfera
                }
            })
    return pd.DataFrame(registros)



def inferir_direcionalidade_capag(df: pd.DataFrame) -> pd.DataFrame:
    indicadores = df["indicador_id"].unique()
    cache_path = config.MAPA_DIRECIONALIDADE_PATH
    try:
        direcionalidades = carregar_cache_json(cache_path)
    except Exception:
        direcionalidades = {}

    novos = [i for i in indicadores if i not in direcionalidades]

    if check_server():
        for indicador in novos:
            try:
                direcionalidades[indicador] = inferir_direcionalidade(
                    indicador
                )
                logger.info(
                    f"🧠 Inferido: {indicador} → "
                    f"{direcionalidades[indicador]}"
                )
            except Exception as e:
                logger.warning(f"Erro ao inferir {indicador}: {e}")
        salvar_cache_json(direcionalidades, cache_path)
    else:
        logger.warning("LLM offline — usando apenas cache local")

    df["direcionalidade"] = df["indicador_id"].map(direcionalidades)
    return df


def main():
    logger.info("🚀 Iniciando pré-processamento CAPAG...")
    base_path = Path("dados/tesouro-nacional/capag")
    estados_path = (
        base_path / "estados/Capag-Estados-2022-1-revisada.xlsx"
    )
    municipios_path = (
        base_path / "municipios/"
        "CAPAG-Oficial-Municipios-2023-02-23-corrigido.xlsx"
    )

    df_estados = load_capag_estados(estados_path)
    df_municipios = load_capag_municipios(municipios_path)

    df = pd.concat([df_estados, df_municipios], ignore_index=True)
    df_final = preprocess(df)
    df_final = inferir_direcionalidade_capag(df_final)

    output_path = base_path / "preprocessed/indicadores_capag_2022.csv"
    salvar_csv(df_final, output_path)
    logger.info(f"💾 Arquivo salvo: {output_path}")

    logger.info("☁️ Enviando ao bucket GCS...")
    upload_to_bucket(
        local_path=str(output_path),
        bucket_path=(
            "indicadores/processados/"
            "tesouro-nacional/capag/indicadores.csv"
        )
    )

    logger.info("📥 Upload para BigQuery...")
    upload_csv_to_bigquery(
        csv_path=str(output_path),
        table_id="observatudo-infra.dados.raw_capag"
    )

    logger.info("✅ Finalizado com sucesso!")
