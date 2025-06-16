{{ config(
    materialized='table',
    partition_by={
        "field": "data_referencia",
        "data_type": "date"
    },
    cluster_by=["indicador_id", "localidade_id"]
) }}

with fonte as (
    select
        indicador_id,
        codigo_ibge as localidade_id,
        ano,
        valor,
        justificativa,
        CAST(data_processamento AS TIMESTAMP) as data_insercao,
        case
          when ano is not null and ano > 0 then DATE(ano, 1, 1)
          else null
        end as data_referencia,
        'cidades_sustentaveis' as fonte,
        null as url_fonte,
        null as metodologia_calculo,
        null as data_coleta,
        null as confiabilidade,
        null as usuario_insercao,
        'dbt_etl' as processo_etl,
        null as versao_metodologia,
        null as flags,
        null as metadados,
        null as direcionalidade,
        null as esfera_poder,
        null as nota
    from {{ ref('stg_cidades_sustentaveis') }}
    where valor is not null

    UNION ALL

    -- CAPAG (componentes)
    select
        indicador_id,
        localidade_id,
        ano,
        valor,
        justificativa,
        data_insercao,
        data_referencia,
        fonte,
        url_fonte,
        metodologia_calculo,
        data_coleta,
        confiabilidade,
        usuario_insercao,
        processo_etl,
        versao_metodologia,
        flags,
        metadados,
        direcionalidade,
        esfera_poder,
        nota
    from {{ ref('stg_capag') }}

    UNION ALL

    -- CAPAG (agregado)
    select
        indicador_id,
        localidade_id,
        ano,
        valor,
        null as justificativa,
        CAST(data_referencia AS TIMESTAMP) as data_insercao,
        data_referencia,
        fonte,
        null as url_fonte,
        null as metodologia_calculo,
        null as data_coleta,
        null as confiabilidade,
        null as usuario_insercao,
        'dbt_etl' as processo_etl,
        null as versao_metodologia,
        null as flags,
        null as metadados,
        direcionalidade,
        esfera_poder,
        nota
    from {{ ref('int_capag') }}
)

select * from fonte
