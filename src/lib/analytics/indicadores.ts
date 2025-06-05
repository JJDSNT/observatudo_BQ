//src/lib/analytics/indicadores.ts
import { QueryBuilder } from "./query";
import type { Indicador } from '@/types/indicadores';

export async function listarIndicadores(): Promise<Indicador[]> {
  const qb = new QueryBuilder('dim_indicadores')
    .addDimension({ name: 'id', sql: 'indicador_id', type: 'string' })
    .addDimension({ name: 'nome', sql: 'nome', type: 'string' })
    .addDimension({ name: 'descricao', sql: 'descricao', type: 'string' })
    .addDimension({ name: 'unidade', sql: 'unidade', type: 'string' })
    .addDimension({ name: 'fonte', sql: 'fonte', type: 'string' })
    .addDimension({ name: 'periodicidade', sql: 'periodicidade', type: 'string' });

  return qb.execute<Indicador>();
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

