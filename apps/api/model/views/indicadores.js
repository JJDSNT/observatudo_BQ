view(`indicadores`, {
  description: `Visão denormalizada de indicadores (fact + as duas dimensões) — candidata a substituir as rotas src/app/api/indicadores/* do frontend, que hoje acessam o BigQuery direto.`,

  cubes: [
    {
      join_path: `fact_indicadores`,
      includes: [
        `ano`,
        `data_referencia`,
        `justificativa`,
        `count`,
        `valor_total`,
        `valor_medio`,
        `valor_minimo`,
        `valor_maximo`,
        // Classificação categórica (ex.: nota CAPAG A/B/C/D) — alguns
        // indicadores não têm valor numérico, só essa nota.
        `nota`,
      ],
    },
    {
      join_path: `fact_indicadores.dim_indicadores`,
      includes: [
        `indicador_id`,
        `nome`,
        `descricao`,
        `formula`,
        `eixo`,
        `eixo_ia`,
        `categoria`,
        `unidade`,
        `fonte`,
        `periodicidade`,
      ],
    },
    {
      join_path: `fact_indicadores.dim_localidades`,
      prefix: true,
      includes: [`localidade_id`, `nome`, `tipo`, `sigla`, `regiao`],
    },
  ],
});
