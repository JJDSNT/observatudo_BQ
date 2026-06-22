//src/lib/analytics/indicadores.ts
import { QueryBuilder } from "./query";
import type { Indicador } from '@/types';

export async function buscarIndicadores(query: string): Promise<Indicador[]> {
  const lowerQuery = query.toLowerCase();
  const qb = new QueryBuilder("dim_indicadores")
    .addDimension({ name: "id", sql: "indicador_id", type: "string" })
    .addDimension({ name: "nome", sql: "nome", type: "string" })
    .addDimension({ name: "descricao", sql: "descricao", type: "string" })
    .orWhereRaw(`
      LOWER(nome) LIKE '%${lowerQuery}%'
      OR LOWER(descricao) LIKE '%${lowerQuery}%'
      OR LOWER(indicador_id) = '${lowerQuery}'
    `)
    .limit(20);

  return qb.execute<Indicador>();
}


export async function nomesIndicadores(ids: string[]): Promise<Indicador[]> {
  const qb = new QueryBuilder("dim_indicadores", "i")
    .addDimension({ name: "id", sql: "i.indicador_id", type: "string" })
    .addDimension({ name: "nome", sql: "i.nome", type: "string" })
    .filter({
      dimension: "i.indicador_id",
      operator: "IN",
      values: ids,
    });

  return qb.execute<Indicador>();
}

