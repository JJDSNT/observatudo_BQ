-- sql/silver/world_bank.sql
-- Primeiro indicador internacional (ISSUE-0019). Passthrough no estilo de
-- silver/capag.sql: já entrega o shape completo do fato, sem cálculo
-- inline em fact_indicadores.sql.

select
  indicador_id,
  localidade_id,
  ano,
  valor,
  cast(null as string) as justificativa,
  CAST(data_processamento AS TIMESTAMP) as data_insercao,
  DATE(ano, 1, 1) as data_referencia,
  'world_bank' as fonte,
  cast(null as string) as url_fonte,
  cast(null as string) as metodologia_calculo,
  cast(null as string) as data_coleta,
  cast(null as string) as confiabilidade,
  cast(null as string) as usuario_insercao,
  'pipeline_etl' as processo_etl,
  cast(null as string) as versao_metodologia,
  cast(null as string) as flags,
  cast(null as string) as metadados,
  cast(null as string) as direcionalidade,
  cast(null as string) as esfera_poder,
  cast(null as string) as nota
from `raw.raw_world_bank`
where valor is not null
