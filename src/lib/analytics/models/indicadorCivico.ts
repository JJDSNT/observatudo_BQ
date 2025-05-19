// lib/analytics/models/indicadorCivico.ts

import { QueryBuilder } from "../query";

export class IndicadorCivico {
  static serieHistorica(
    indicadorId: string,
    localIds: string[],
    anos: number = 5
  ) {
    const currentYear = new Date().getFullYear();
    //const startYear = currentYear - anos + 1;
    const startYear = 2000;

    const query = new QueryBuilder("fact_indicadores", "f")
      .addDimension({
        name: "data",
        sql: "f.data_referencia",
        type: "date",
      })
      .addDimension({
        name: "localNome",
        sql: "l.nome",
        type: "string",
      })
      .addDimension({
        name: "indicadorNome",
        sql: "i.nome",
        type: "string",
      })
      /*.addDimension({
        name: "unidade",
        sql: "i.unidade",
        type: "string",
      })
      .addDimension({
        name: "fonte",
        sql: "i.fonte",
        type: "string",
      })*/
      .addMeasure({
        name: "valor",
        sql: "f.valor",
        type: "avg",
      })
      .join("dim_localidades", "l", "f.localidade_id = l.localidade_id")
      .join("dim_indicadores", "i", "f.indicador_id = i.indicador_id")
      .filter({
        dimension: "f.indicador_id",
        operator: "=",
        values: [indicadorId],
      })
      .filter({
        dimension: "f.localidade_id",
        operator: "IN",
        values: localIds,
      })
      .filter({
        dimension: "EXTRACT(YEAR FROM f.data_referencia)",
        operator: ">=",
        values: [startYear],
      })
      .orderBy("f.data_referencia", "ASC")
      .orderBy("l.nome", "ASC");

    return query;
  }

  static consultarPorRegiao(
    categoria: string,
    regiao: string,
    periodo: { inicio: string; fim: string }
  ) {
    const query = new QueryBuilder("fact_indicadores", "f")
      .addDimension({
        name: "indicador_nome",
        sql: "i.nome",
        type: "string",
      })
      .addDimension({
        name: "localidade_nome",
        sql: "l.nome",
        type: "string",
      })
      .addMeasure({
        name: "valor_medio",
        sql: "f.valor",
        type: "avg",
      })
      .join("dim_indicadores", "i", "f.indicador_id = i.id")
      .join("dim_localidades", "l", "f.localidade_id = l.localidade_id")
      .filter({
        dimension: "i.categoria",
        operator: "=",
        values: [categoria],
      })
      .filter({
        dimension: "l.regiao",
        operator: "=",
        values: [regiao],
      })
      .filter({
        dimension: "f.data_referencia",
        operator: ">=",
        values: [periodo.inicio],
      })
      .filter({
        dimension: "f.data_referencia",
        operator: "<=",
        values: [periodo.fim],
      });

    return query;
  }
}
