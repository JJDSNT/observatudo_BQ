-- sql/silver/capag.sql
-- Equivalente a dbt/observatudo/models/staging/stg_capag.sql (sem dbt).

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
from `raw.raw_capag`
where indicador_id is not null
