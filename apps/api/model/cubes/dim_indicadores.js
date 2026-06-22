cube(`dim_indicadores`, {
  sql_table: `gold.dim_indicadores`,

  dimensions: {
    indicador_id: {
      sql: `indicador_id`,
      type: `string`,
      primary_key: true,
      // Primary keys ficam public:false por padrão — mas o frontend
      // precisa filtrar/selecionar por indicador_id diretamente (busca,
      // resolução de nomes), não só usar como chave de join interna.
      public: true,
    },
    nome: { sql: `nome`, type: `string` },
    descricao: { sql: `descricao`, type: `string` },
    eixo: { sql: `eixo`, type: `string` },
    eixo_ia: { sql: `eixo_ia`, type: `string` },
    categoria: { sql: `categoria`, type: `string` },
    categoria_origem: { sql: `categoria_origem`, type: `string` },
    formula: { sql: `formula`, type: `string` },
    meta_ods: { sql: `meta_ods`, type: `string` },
    numero_ods: { sql: `numero_ods`, type: `string` },
    nome_ods: { sql: `nome_ods`, type: `string` },
    unidade: { sql: `unidade`, type: `string` },
    fonte: { sql: `fonte`, type: `string` },
    periodicidade: { sql: `periodicidade`, type: `string` },
  },
});
