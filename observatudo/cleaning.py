import pandas as pd
from datetime import datetime, timezone


def renomear_colunas(df: pd.DataFrame) -> pd.DataFrame:
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
    return df[list(colunas_renomeadas.values())]


def converter_valores(df: pd.DataFrame) -> pd.DataFrame:
    df["valor_original"] = df["valor"]
    df["valor"] = pd.to_numeric(
        df["valor"]
        .astype(str)
        .str.replace(".", "", regex=False)
        .str.replace(",", ".", regex=False),
        errors="coerce"
    )
    df["ano"] = pd.to_numeric(df["ano"], errors="coerce").astype("Int64")
    return df


def limpar_justificativas(df: pd.DataFrame) -> pd.DataFrame:
    df["justificativa"] = df["justificativa"].fillna("").str.replace("\n", " ")
    return df


def adicionar_data_processamento(df: pd.DataFrame) -> pd.DataFrame:
    df["data_processamento"] = datetime.now(timezone.utc)
    return df
