//src/lib/analytics/indicadores.ts
import { QueryBuilder } from "./query";
import { cubejsApi } from "@/lib/cubejs/client";
import type { Indicador } from '@/types';

export async function buscarIndicadores(
  query: string
): Promise<Pick<Indicador, "id" | "nome" | "descricao">[]> {
  const resultSet = await cubejsApi.load({
    dimensions: [
      "dim_indicadores.indicador_id",
      "dim_indicadores.nome",
      "dim_indicadores.descricao",
    ],
    filters: [
      {
        or: [
          { member: "dim_indicadores.nome", operator: "contains", values: [query] },
          { member: "dim_indicadores.descricao", operator: "contains", values: [query] },
          { member: "dim_indicadores.indicador_id", operator: "equals", values: [query] },
        ],
      },
    ],
    limit: 20,
  });

  return resultSet.rawData().map((row) => ({
    id: String(row["dim_indicadores.indicador_id"]),
    nome: String(row["dim_indicadores.nome"] ?? ""),
    descricao:
      row["dim_indicadores.descricao"] != null
        ? String(row["dim_indicadores.descricao"])
        : undefined,
  }));
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

