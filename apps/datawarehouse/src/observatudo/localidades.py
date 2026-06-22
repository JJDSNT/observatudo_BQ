"""Resolução de `localidade_id` canônico a partir de chaves brutas de fontes.

`dim_localidades.localidade_id` é um id interno (surrogate), não a chave
natural de nenhuma autoridade externa — IBGE não numera país nem existe
fora do Brasil, e ISO não desce a nível de município. Qualquer transformer
que ingere dado geográfico deve resolver sua chave bruta (sigla, código
IBGE etc.) contra a referência canônica aqui, em vez de copiar o valor da
fonte direto para `localidade_id`.

As funções abaixo formalizam o mapeamento Brasil/IBGE que já era feito
inline em `scripts/carregar_localidades_ibge.py`. Indicadores
internacionais devem ganhar resolvers próprios (ISO), lado a lado com
estes — sem substituí-los.
"""
from functools import lru_cache

import pandas as pd

from observatudo import config


class LocalidadeDesconhecidaError(ValueError):
    pass


@lru_cache
def _carregar_estados() -> pd.DataFrame:
    df = pd.read_csv(f"{config.IBGE_LOCALIDADES_DIR}/estados.csv")
    df["SIGLA"] = df["SIGLA"].str.strip()
    return df


@lru_cache
def _carregar_municipios() -> pd.DataFrame:
    return pd.read_csv(f"{config.IBGE_LOCALIDADES_DIR}/municipios_c_capital.csv")


def resolver_estado_por_sigla(sigla: str) -> str:
    """Normaliza a sigla bruta de uma UF (ex.: `" sp"`) para o
    `localidade_id` canônico de `dim_localidades` (ex.: `"BR-SP"`).
    """
    sigla_normalizada = sigla.strip().upper()
    estados = _carregar_estados()
    if sigla_normalizada not in estados["SIGLA"].values:
        raise LocalidadeDesconhecidaError(f"Sigla de UF desconhecida: {sigla!r}")
    return f"BR-{sigla_normalizada}"


def resolver_municipio_por_codigo_ibge(codigo: str | int) -> str:
    """Valida um código IBGE de município contra a referência oficial e
    devolve o `localidade_id` canônico (o próprio código, como string).
    """
    codigo_normalizado = str(codigo).strip()
    municipios = _carregar_municipios()
    if int(codigo_normalizado) not in municipios["codigo_ibge"].values:
        raise LocalidadeDesconhecidaError(
            f"Código IBGE de município desconhecido: {codigo!r}"
        )
    return codigo_normalizado


def resolver_estado_de_municipio(codigo_uf: str | int) -> str:
    """Resolve o `localidade_id` do estado (ex.: `"BR-SP"`) a partir do
    código IBGE de UF (ex.: `35`) presente nos dados de município — o
    mesmo cruzamento já usado em `carregar_localidades_ibge.py` para
    montar `localidade_pai_id`.
    """
    estados = _carregar_estados()
    linha = estados[estados["COD"] == int(codigo_uf)]
    if linha.empty:
        raise LocalidadeDesconhecidaError(f"Código IBGE de UF desconhecido: {codigo_uf!r}")
    return f"BR-{linha.iloc[0]['SIGLA']}"
