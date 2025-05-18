// lib/analytics/models/indicadorCivico.ts
import { QueryBuilder } from '../query';

export class IndicadorCivico {
  // Dimensões comuns
  static dimensoes = {
    data: {
      name: 'data',
      sql: 'f.data_referencia',
      type: 'date'
    },
    ano: {
      name: 'ano',
      sql: 'EXTRACT(YEAR FROM f.data_referencia)',
      type: 'number'
    },
    mes: {
      name: 'mes',
      sql: 'EXTRACT(MONTH FROM f.data_referencia)',
      type: 'number'
    },
    localNome: {
      name: 'localNome',
      sql: 'l.nome',
      type: 'string'
    },
    localTipo: {
      name: 'localTipo',
      sql: 'l.tipo',
      type: 'string'
    },
    indicadorNome: {
      name: 'indicadorNome',
      sql: 'i.nome',
      type: 'string'
    },
    categoria: {
      name: 'categoria',
      sql: 'i.categoria',
      type: 'string'
    }
  };

  // Métricas comuns
  static metricas = {
    valor: {
      name: 'valor',
      sql: 'f.valor',
      type: 'avg' as const
    },
    totalRegistros: {
      name: 'totalRegistros',
      sql: '1',
      type: 'count' as const
    },
    valorMaximo: {
      name: 'valorMaximo',
      sql: 'f.valor',
      type: 'max' as const
    },
    valorMinimo: {
      name: 'valorMinimo',
      sql: 'f.valor',
      type: 'min' as const
    }
  };

  // Consultas pré-construídas
  static consultarPorRegiao(categoria: string, regiao: string, periodo: {inicio: string, fim: string}) {
    const query = new QueryBuilder('fact_indicadores f')
      .addDimension(this.dimensoes.data)
      .addDimension(this.dimensoes.localNome)
      .addDimension(this.dimensoes.indicadorNome)
      .addMeasure(this.metricas.valor)
      .filter({
        dimension: 'i.categoria',
        operator: '=',
        values: [categoria]
      })
      .filter({
        dimension: 'l.nome',
        operator: '=',
        values: [regiao]
      })
      .filter({
        dimension: 'f.data_referencia',
        operator: '>=',
        values: [periodo.inicio]
      })
      .filter({
        dimension: 'f.data_referencia',
        operator: '<=',
        values: [periodo.fim]
      })
      .orderBy('f.data_referencia', 'DESC');
      
    return query;
  }

  static serieHistorica(indicadorId: string, localIds: string[], anos: number) {
    const query = new QueryBuilder('fact_indicadores f')
      .addDimension(this.dimensoes.data)
      .addDimension(this.dimensoes.localNome)
      .addMeasure(this.metricas.valor)
      .filter({
        dimension: 'f.indicador_id',
        operator: '=',
        values: [indicadorId]
      })
      .filter({
        dimension: 'f.local_id',
        operator: 'IN',
        values: localIds
      })
      .filter({
        dimension: `EXTRACT(YEAR FROM f.data_referencia)`,
        operator: '>=',
        values: [new Date().getFullYear() - anos]
      })
      .orderBy('f.data_referencia', 'ASC')
      .orderBy('l.nome', 'ASC');
      
    return query;
  }
}