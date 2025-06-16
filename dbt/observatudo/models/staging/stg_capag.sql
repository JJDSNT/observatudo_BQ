-- models/staging/stg_capag.sql

{{ config(
    materialized='table'
) }}

with origem as (
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
    nota,
    esfera_poder
  from {{ source('dados', 'raw_capag') }}
  where indicador_id is not null
)

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
  nota,
  esfera_poder
from origem
