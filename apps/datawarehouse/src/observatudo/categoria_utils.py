from observatudo.constants import CATEGORIAS_VALIDAS


def verificar_classificacao(eixo: str) -> bool:
    return eixo in CATEGORIAS_VALIDAS


def gerar_relatorio_erros(erros: list, caminho: str):
    import pandas as pd
    df_erros = pd.DataFrame(erros)
    df_erros.to_csv(caminho, index=False)
    print(f"🚫 Relatório de erros salvo em: {caminho}")
