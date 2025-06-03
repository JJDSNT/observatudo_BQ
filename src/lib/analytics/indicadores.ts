import { QueryBuilder } from "./query";

export interface Indicador {
  id: string;
  nome: string;
  descricao: string;
}

export async function buscarIndicadores(query: string): Promise<Indicador[]> {
  const qb = new QueryBuilder("dim_indicadores")
    .addDimension({ name: "id", sql: "indicador_id", type: "string" })
    .addDimension({ name: "nome", sql: "nome", type: "string" })
    .addDimension({ name: "descricao", sql: "descricao", type: "string" })
    .filter({
      dimension: "nome",
      operator: "CONTAINS",
      values: [query.toLowerCase()],
    })
    .filter({
      dimension: "descricao",
      operator: "CONTAINS",
      values: [query.toLowerCase()],
    })
    .limit(20);

  return qb.execute<Indicador>();
}
