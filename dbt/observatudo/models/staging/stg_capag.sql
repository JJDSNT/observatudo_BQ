-- models/staging/stg_capag.sql
{{ config(materialized='table') }}

SELECT
  indicador_id,
  CAST(localidade_id AS STRING) AS localidade_id,
  ano,
  valor,
  justificativa,
  data_insercao,
  SAFE.PARSE_DATE('%Y-%m-%d', data_referencia) AS data_referencia,
  fonte,
  url_fonte,
  metodologia_calculo,
  data_coleta,
  confiabilidade,
  usuario_insercao,
  processo_etl,
  versao_metodologia,
  flags,
  TO_JSON_STRING(metadados) AS metadados
FROM `observatudo-infra.dados.raw_capag`
WHERE valor IS NOT NULL
