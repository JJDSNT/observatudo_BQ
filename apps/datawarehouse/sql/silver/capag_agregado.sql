-- sql/silver/capag_agregado.sql
-- Equivalente a dbt/observatudo/models/intermediate/int_capag.sql (sem dbt).
-- Agrega os 4 componentes do CAPAG (Endividamento, Poupança Corrente,
-- Liquidez, Nota Final) num indicador único por localidade/ano.

select
  localidade_id,
  ano,
  "capag" as indicador_id,
  avg(cast(valor as float64)) as valor,
  CAST(any_value(data_referencia) AS DATE) as data_referencia,
  any_value(fonte) as fonte,
  "a > b > c" as direcionalidade,
  any_value(nota) as nota,
  any_value(esfera_poder) as esfera_poder
from `silver.capag`
where indicador_id in (
  'CAPAG - Endividamento',
  'CAPAG - Poupança Corrente',
  'CAPAG - Liquidez',
  'CAPAG - Nota Final'
)
and SAFE_CAST(localidade_id AS INT64) IS NOT NULL
group by localidade_id, ano
