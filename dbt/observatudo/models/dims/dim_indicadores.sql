-- models/dims/dim_indicadores.sql

{{ config(
    materialized='view'
) }}

with source as (

  -- Indicadores do Cidades Sustentáveis
  select
      indicador_id,
      nome,
      descricao,
      eixo,
      eixo_ia,
      formula,
      meta_ods,
      numero_ods,
      nome_ods
  from {{ ref('stg_cidades_sustentaveis') }}

  union all

  -- Indicadores do CAPAG agregado
  select
      indicador_id,
      'Índice CAPAG Agregado' as nome,
      'Nota média de sustentabilidade fiscal com base nos três componentes: Endividamento, Poupança Corrente e Liquidez.' as descricao,
      null as eixo,
      'Finanças' as eixo_ia,
      null as formula,
      null as meta_ods,
      null as numero_ods,
      null as nome_ods
  from {{ ref('int_capag') }}
)

select
    indicador_id,
    any_value(nome) as nome,
    any_value(descricao) as descricao,
    any_value(eixo) as eixo,
    any_value(eixo_ia) as eixo_ia,
    any_value(eixo_ia) as categoria,
    'ia' as categoria_origem,
    any_value(formula) as formula,
    any_value(meta_ods) as meta_ods,
    any_value(numero_ods) as numero_ods,
    any_value(nome_ods) as nome_ods
from source
group by indicador_id
