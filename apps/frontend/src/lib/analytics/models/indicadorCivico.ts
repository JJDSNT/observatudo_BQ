// lib/analytics/models/indicadorCivico.ts

import { cubejsApi } from "@/lib/cubejs/client";

export interface PontoSerieIndicador {
  indicadorId: string;
  localidadeId: string;
  indicadorNome: string;
  descricao: string;
  formula: string;
  unidade: string;
  fonte: string;
  data: string;
  valor: number | null;
  // Classificação categórica (ex.: nota CAPAG) — ver ValorSerie.nota.
  nota: string | null;
}

export class IndicadorCivico {
  /**
   * Busca a série histórica de vários indicadores em várias localidades
   * numa única consulta ao Cube.js (em vez de uma consulta por
   * indicador x localidade, como era com o BigQuery direto).
   */
  static async serieHistoricaBatch(
    indicadorIds: string[],
    localidadeIds: string[]
  ): Promise<PontoSerieIndicador[]> {
    if (indicadorIds.length === 0 || localidadeIds.length === 0) {
      return [];
    }

    const anoMinimo = 2000;

    const resultSet = await cubejsApi.load({
      dimensions: [
        "indicadores.indicador_id",
        "indicadores.nome",
        "indicadores.descricao",
        "indicadores.formula",
        "indicadores.unidade",
        "indicadores.fonte",
        "indicadores.dim_localidades_localidade_id",
        "indicadores.ano",
        "indicadores.nota",
      ],
      measures: ["indicadores.valor_medio"],
      filters: [
        {
          member: "indicadores.indicador_id",
          operator: "equals",
          values: indicadorIds,
        },
        {
          member: "indicadores.dim_localidades_localidade_id",
          operator: "equals",
          values: localidadeIds,
        },
        {
          member: "indicadores.ano",
          operator: "gte",
          values: [String(anoMinimo)],
        },
      ],
      order: { "indicadores.ano": "asc" },
    });

    return resultSet.rawData().map((row) => ({
      indicadorId: String(row["indicadores.indicador_id"]),
      localidadeId: String(row["indicadores.dim_localidades_localidade_id"]),
      indicadorNome: String(row["indicadores.nome"] ?? ""),
      descricao: row["indicadores.descricao"] != null ? String(row["indicadores.descricao"]) : "",
      formula: row["indicadores.formula"] != null ? String(row["indicadores.formula"]) : "",
      unidade:
        row["indicadores.unidade"] != null
          ? String(row["indicadores.unidade"])
          : "",
      fonte:
        row["indicadores.fonte"] != null ? String(row["indicadores.fonte"]) : "",
      // Granularidade real dos dados é sempre anual (verificado
      // estruturalmente — ver dim_indicadores.sql); usar `ano` em vez de
      // `data_referencia` evita um bug do driver BigQuery do Cube ao
      // incluir dimensão `time` direto em `dimensions` (tenta um cast
      // de timezone inválido pra coluna DATE: "Could not cast literal
      // 'UTC' to type TIME").
      data: String(row["indicadores.ano"]),
      valor:
        row["indicadores.valor_medio"] != null
          ? Number(row["indicadores.valor_medio"])
          : null,
      nota:
        row["indicadores.nota"] != null ? String(row["indicadores.nota"]) : null,
    }));
  }
}
