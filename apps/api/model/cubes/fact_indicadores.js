cube(`fact_indicadores`, {
  sql_table: `gold.fact_indicadores`,

  joins: {
    dim_indicadores: {
      relationship: `many_to_one`,
      sql: `${CUBE}.indicador_id = ${dim_indicadores}.indicador_id`,
    },
    dim_localidades: {
      relationship: `many_to_one`,
      sql: `${CUBE}.localidade_id = ${dim_localidades}.localidade_id`,
    },
  },

  measures: {
    count: { type: `count` },
    valor_total: { sql: `valor`, type: `sum` },
    valor_medio: { sql: `valor`, type: `avg` },
    valor_minimo: { sql: `valor`, type: `min` },
    valor_maximo: { sql: `valor`, type: `max` },
  },

  dimensions: {
    // Não existe coluna de chave única na tabela (grão é
    // indicador+localidade+ano); chave sintética só para o Cube
    // conseguir fazer count distinct/joins corretamente.
    id: {
      sql: `CONCAT(${CUBE}.indicador_id, '|', ${CUBE}.localidade_id, '|', CAST(${CUBE}.ano AS STRING))`,
      type: `string`,
      primary_key: true,
    },
    indicador_id: { sql: `indicador_id`, type: `string` },
    localidade_id: { sql: `localidade_id`, type: `string` },
    ano: { sql: `ano`, type: `number` },
    justificativa: { sql: `justificativa`, type: `string` },
    data_referencia: { sql: `data_referencia`, type: `time` },
    data_insercao: { sql: `data_insercao`, type: `time` },
    fonte: { sql: `fonte`, type: `string` },
    url_fonte: { sql: `url_fonte`, type: `string` },
    metodologia_calculo: { sql: `metodologia_calculo`, type: `string` },
    data_coleta: { sql: `data_coleta`, type: `string` },
    confiabilidade: { sql: `confiabilidade`, type: `string` },
    direcionalidade: { sql: `direcionalidade`, type: `string` },
    esfera_poder: { sql: `esfera_poder`, type: `string` },
    nota: { sql: `nota`, type: `string` },
  },
});
