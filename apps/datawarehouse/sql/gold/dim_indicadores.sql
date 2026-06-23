-- sql/gold/dim_indicadores.sql
-- Equivalente a dbt/observatudo/models/dims/dim_indicadores.sql (sem dbt).

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
      nome_ods,
      fonte,
      -- Sem unidade por indicador na fonte original (nem na planilha, nem
      -- em algum catálogo derivado) — fica null até existir referência real.
      cast(null as string) as unidade,
      -- Periodicidade de amostragem (não de atualização do pipeline):
      -- verificado que (indicador_id, localidade, ano) é sempre único na
      -- fonte (sem duplicidade dentro do mesmo ano) — ou seja, cada
      -- indicador tem no máximo 1 observação/ano, mesmo quando a fórmula
      -- calcula uma média mensal a partir do total anual (ex.: "consumo
      -- per capita /12"). A granularidade real da amostra é anual.
      'anual' as periodicidade
  from `silver.cidades_sustentaveis`

  union all

  -- Indicadores do CAPAG agregado
  select
      indicador_id,
      'Índice CAPAG Agregado' as nome,
      'Nota oficial de Capacidade de Pagamento (CAPAG) do Tesouro Nacional — classificação A/B/C/D combinando os três componentes (Endividamento, Poupança Corrente e Liquidez). Ver coluna `nota` em fact_indicadores; `valor` não se aplica (classificação categórica, não numérica).' as descricao,
      null as eixo,
      'Finanças' as eixo_ia,
      null as formula,
      null as meta_ods,
      null as numero_ods,
      null as nome_ods,
      fonte,
      -- Classificação categórica (A/B/C/D), não tem unidade numérica.
      cast(null as string) as unidade,
      'anual' as periodicidade
  from `silver.capag_agregado`

  union all

  -- Indicadores internacionais (World Bank) — ISSUE-0019
  select * from unnest([
    struct(
      'NY.GDP.PCAP.CD' as indicador_id,
      'PIB per capita' as nome,
      'Produto Interno Bruto dividido pela população, a preços correntes em dólares americanos. Fonte: World Bank Open Data.' as descricao,
      cast(null as string) as eixo,
      'Economia' as eixo_ia,
      cast(null as string) as formula,
      cast(null as string) as meta_ods,
      cast(null as string) as numero_ods,
      cast(null as string) as nome_ods,
      'world_bank' as fonte,
      'US$' as unidade,
      'anual' as periodicidade
    ),
    struct(
      'SP.DYN.LE00.IN',
      'Expectativa de vida ao nascer',
      'Número médio de anos que um recém-nascido viveria, mantidas as condições de mortalidade do ano de referência. Fonte: World Bank Open Data.',
      cast(null as string),
      'Saúde',
      cast(null as string),
      cast(null as string),
      cast(null as string),
      cast(null as string),
      'world_bank',
      'anos',
      'anual'
    ),
    struct(
      'SP.POP.TOTL',
      'População total',
      'População total do país, contagem de meio do ano (todos os residentes, independente de status legal ou cidadania). Fonte: World Bank Open Data.',
      cast(null as string),
      'Demografia',
      cast(null as string),
      cast(null as string),
      cast(null as string),
      cast(null as string),
      'world_bank',
      'habitantes',
      'anual'
    )
  ])
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
    any_value(nome_ods) as nome_ods,
    any_value(unidade) as unidade,
    any_value(fonte) as fonte,
    any_value(periodicidade) as periodicidade
from source
group by indicador_id
