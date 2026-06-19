-- sql/gold/fact_indicadores.sql
-- Equivalente a dbt/observatudo/models/facts/fact_indicadores.sql (sem dbt).
-- Particionamento/cluster são configurados pelo runner (ver pipeline/steps.py),
-- não aqui — este arquivo é só o SELECT.

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
        'pipeline_etl' as processo_etl,
        null as versao_metodologia,
        null as flags,
        null as metadados,
        null as direcionalidade,
        null as esfera_poder,
        null as nota
    from `silver.cidades_sustentaveis`
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
    from `silver.capag`

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
        'pipeline_etl' as processo_etl,
        null as versao_metodologia,
        null as flags,
        null as metadados,
        direcionalidade,
        esfera_poder,
        nota
    from `silver.capag_agregado`
)

select * from fonte
