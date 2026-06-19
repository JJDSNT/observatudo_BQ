from observatudo.pipeline.runner import build_ddl
from observatudo.pipeline.steps import Step


def test_build_ddl_table():
    step = Step(name="silver.capag", sql_file="silver/capag.sql", dataset="silver", table="capag")
    ddl = build_ddl(step, "select 1")

    assert ddl == "CREATE OR REPLACE TABLE `silver.capag` AS (\nselect 1\n)"


def test_build_ddl_view():
    step = Step(
        name="gold.dim_indicadores",
        sql_file="gold/dim_indicadores.sql",
        dataset="gold",
        table="dim_indicadores",
        materialization="view",
    )
    ddl = build_ddl(step, "select 1")

    assert ddl == "CREATE OR REPLACE VIEW `gold.dim_indicadores` AS (\nselect 1\n)"


def test_build_ddl_partition_and_cluster():
    step = Step(
        name="gold.fact_indicadores",
        sql_file="gold/fact_indicadores.sql",
        dataset="gold",
        table="fact_indicadores",
        partition_by="data_referencia",
        cluster_by=["indicador_id", "localidade_id"],
    )
    ddl = build_ddl(step, "select 1")

    assert ddl == (
        "CREATE OR REPLACE TABLE `gold.fact_indicadores` "
        "PARTITION BY data_referencia CLUSTER BY indicador_id, localidade_id "
        "AS (\nselect 1\n)"
    )
