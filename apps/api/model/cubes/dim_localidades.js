cube(`dim_localidades`, {
  sql_table: `gold.dim_localidades`,

  dimensions: {
    localidade_id: {
      sql: `localidade_id`,
      type: `string`,
      primary_key: true,
      // Mesmo motivo do indicador_id em dim_indicadores.js: frontend
      // precisa filtrar por localidade_id diretamente.
      public: true,
    },
    nome: { sql: `nome`, type: `string` },
    tipo: { sql: `tipo`, type: `string` },
    localidade_pai_id: { sql: `localidade_pai_id`, type: `string` },
    sigla: { sql: `sigla`, type: `string` },
    regiao: { sql: `regiao`, type: `string` },
    // Coluna real no BigQuery tem acento (`é_capital`) — precisa de
    // backtick no SQL gerado; o nome da dimensão fica sem acento.
    e_capital: { sql: `\`é_capital\``, type: `boolean` },
    capital_localidade_id: { sql: `capital_localidade_id`, type: `string` },
    latitude: { sql: `latitude`, type: `number` },
    longitude: { sql: `longitude`, type: `number` },
    populacao: { sql: `populacao`, type: `number` },
    // Código IBGE: 2 dígitos p/ estado, 7 p/ município, nulo p/ país.
    codigo_ibge: { sql: `codigo_ibge`, type: `string` },
    // ISO 3166-1 (país) / ISO 3166-2 (estado); nulo p/ município (sem
    // padrão ISO nesse nível).
    codigo_iso: { sql: `codigo_iso`, type: `string` },
    data_inclusao: { sql: `data_inclusao`, type: `time` },
  },
});
