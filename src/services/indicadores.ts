// services/indicadores.ts
import { IndicadorCivico } from '../lib/analytics/models/indicadorCivico';

export async function getIndicadoresPorRegiao(categoria: string, regiao: string, periodo: {inicio: string, fim: string}) {
  const query = IndicadorCivico.consultarPorRegiao(categoria, regiao, periodo);
  return await query.execute();
}

export async function getSerieHistorica(indicadorId: string, localIds: string[], anos: number = 5) {
  const query = IndicadorCivico.serieHistorica(indicadorId, localIds, anos);
  return await query.execute();
}

export async function getRankingMunicipios(indicadorId: string, uf: string, ano: number, limit: number = 10) {
  const query = new QueryBuilder('fact_indicadores f')
    .addDimension({
      name: 'municipio',
      sql: 'l.nome',
      type: 'string'
    })
    .addMeasure({
      name: 'valor',
      sql: 'f.valor',
      type: 'avg'
    })
    .filter({
      dimension: 'f.indicador_id',
      operator: '=',
      values: [indicadorId]
    })
    .filter({
      dimension: 'l.tipo',
      operator: '=',
      values: ['municipio']
    })
    .filter({
      dimension: 'l.regiao_maior',
      operator: '=',
      values: [uf]
    })
    .filter({
      dimension: 'EXTRACT(YEAR FROM f.data_referencia)',
      operator: '=',
      values: [ano]
    })
    .orderBy('valor', 'DESC')
    .limit(limit);
    
  return await query.execute();
}