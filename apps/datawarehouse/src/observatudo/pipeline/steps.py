"""Etapas do pipeline raw -> silver -> gold (substitui o grafo de `ref()` do dbt).

A cadeia é pequena e linear, então a ordem da lista já basta como grafo de
dependências — não precisa de um orquestrador.
"""

from dataclasses import dataclass, field


@dataclass(frozen=True)
class Step:
    name: str
    sql_file: str  # caminho relativo a sql/, ex.: "silver/capag.sql"
    dataset: str
    table: str
    materialization: str = "table"  # "table" | "view"
    partition_by: str | None = None
    cluster_by: list[str] = field(default_factory=list)


STEPS: list[Step] = [
    Step(
        name="silver.capag",
        sql_file="silver/capag.sql",
        dataset="silver",
        table="capag",
    ),
    Step(
        name="silver.cidades_sustentaveis",
        sql_file="silver/cidades_sustentaveis.sql",
        dataset="silver",
        table="cidades_sustentaveis",
    ),
    Step(
        name="silver.capag_agregado",
        sql_file="silver/capag_agregado.sql",
        dataset="silver",
        table="capag_agregado",
    ),
    # Materializado como TABLE (não VIEW): a SA www_app só tem IAM em
    # `gold`, não em `silver`. Uma VIEW que lê `silver.*` falharia com
    # "Access Denied" para quem só pode ler `gold` (BigQuery resolve
    # views com a permissão de quem consulta, não de quem criou — a
    # menos que a view seja registrada como "authorized view" em
    # `silver`, o que adicionaria complexidade sem necessidade real
    # aqui). O pipeline já recria isso a cada execução via
    # `CREATE OR REPLACE`, então materializar como tabela não perde
    # frescor nenhum.
    Step(
        name="gold.dim_indicadores",
        sql_file="gold/dim_indicadores.sql",
        dataset="gold",
        table="dim_indicadores",
    ),
    Step(
        name="gold.fact_indicadores",
        sql_file="gold/fact_indicadores.sql",
        dataset="gold",
        table="fact_indicadores",
        partition_by="data_referencia",
        cluster_by=["indicador_id", "localidade_id"],
    ),
]


def steps_for_layer(layer: str) -> list[Step]:
    return [step for step in STEPS if step.dataset == layer]
