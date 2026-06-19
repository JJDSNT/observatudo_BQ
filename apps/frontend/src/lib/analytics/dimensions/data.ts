export const dataReferencia = {
  name: 'data',
  sql: 'f.data_referencia',
  type: 'date'
};

export const ano = {
  name: 'ano',
  sql: 'EXTRACT(YEAR FROM f.data_referencia)',
  type: 'number'
};

export const mes = {
  name: 'mes',
  sql: 'EXTRACT(MONTH FROM f.data_referencia)',
  type: 'number'
};
