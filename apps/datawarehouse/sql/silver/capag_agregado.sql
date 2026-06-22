-- sql/silver/capag_agregado.sql
-- Equivalente a dbt/observatudo/models/intermediate/int_capag.sql (sem dbt).
-- "Índice CAPAG Agregado" = a nota oficial do Tesouro Nacional
-- (CAPAG - Nota Final), não uma média dos 3 componentes — essa nota é
-- categórica (A/B/C/D), por isso `valor` fica null aqui (não tem
-- correspondente numérico real; usar `nota` para exibir/filtrar).

select
  localidade_id,
  ano,
  "capag" as indicador_id,
  cast(null as float64) as valor,
  CAST(data_referencia AS DATE) as data_referencia,
  fonte,
  "a > b > c" as direcionalidade,
  nota,
  esfera_poder
from `silver.capag`
where indicador_id = 'CAPAG - Nota Final'
and localidade_id is not null
