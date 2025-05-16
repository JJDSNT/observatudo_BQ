import pandas as pd


def sanitize_valor(valor):
    try:
        return float(
            str(valor).replace(".", "").replace(",", ".")
        )
    except Exception:
        return None


def clean_justificativa(texto):
    if pd.isna(texto):
        return ""
    return str(texto).replace("\n", " ").strip()
