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
        data_processamento as data_insercao,
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
        null as metadados
    from {{ ref('stg_cidades_sustentaveis') }}
    where valor is not null
)

select * from fonte
