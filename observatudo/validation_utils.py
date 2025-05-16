from observatudo.constants import CATEGORIAS_VALIDAS


def categoria_valida(categoria: str) -> bool:
    return categoria in CATEGORIAS_VALIDAS
