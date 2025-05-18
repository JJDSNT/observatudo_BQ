export const valor = {
  name: 'valor',
  sql: 'f.valor',
  type: 'avg' as const  // ou 'sum', dependendo do padrão principal do seu projeto
};

export const valorMaximo = {
  name: 'valorMaximo',
  sql: 'f.valor',
  type: 'max' as const
};

export const valorMinimo = {
  name: 'valorMinimo',
  sql: 'f.valor',
  type: 'min' as const
};

export const totalRegistros = {
  name: 'totalRegistros',
  sql: '1',
  type: 'count' as const
};
