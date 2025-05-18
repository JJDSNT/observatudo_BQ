// services/indicadores.ts

import { QueryBuilder } from '@/lib/analytics/query';
import { IndicadorCivico } from '../lib/analytics/models/indicadorCivico';
import { getInfoMunicipio, getEstadoDoMunicipio, getInfoPais } from '../lib/analytics/localidadeUtils';

// Mock de lista de indicadores para exemplo
const IDS_INDICADORES_PADRAO = ['24']; // Adicione todos os ids que quiser buscar

export async function getIndicadoresPorRegiao(categoria: string, regiao: string, periodo: { inicio: string, fim: string }) {
  const query = IndicadorCivico.consultarPorRegiao(categoria, regiao, periodo);
  return await query.execute();
}

export async function getSerieHistorica(indicadorId: string, localIds: string[], anos: number = 5) {
  const query = IndicadorCivico.serieHistorica(indicadorId, localIds, anos);
  return await query.execute();
}

export async function getRankingMunicipios(indicadorId: string, uf: string, ano: number, limit: number = 10) {
  const query = new QueryBuilder('fact_indicadores', 'f') // se seu QueryBuilder aceitar alias
    .join('dim_localidades l', 'f.localidade_id = l.id')
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

async function getIndicadoresParaLocalidade(localidadeId: string, categoria?: string) {
  try {
    // No futuro: buscar lista dinâmica do banco, por enquanto, usa o mock IDS_INDICADORES_PADRAO
    const resultados = await Promise.all(
      IDS_INDICADORES_PADRAO.map(async (indicadorId) => {
        try {
          const query = IndicadorCivico.serieHistorica(indicadorId, [localidadeId], 5);
          const data = await query.execute();
          return {
            id: indicadorId,
            nome: data[0]?.indicadorNome ?? `Indicador ${indicadorId}`,
            unidade: '', // adicione se disponível no seu dataset
            fonte: '',   // adicione se disponível
            serie: data.map(row => ({
              data: row.data,
              valor: row.valor
            }))
          };
        } catch (error) {
          console.error(`Erro ao buscar indicador ${indicadorId} para localidade ${localidadeId}:`, error);
          // Retorna um indicador vazio em caso de erro
          return {
            id: indicadorId,
            nome: `Indicador ${indicadorId}`,
            unidade: '',
            fonte: '',
            serie: []
          };
        }
      })
    );
    return resultados;
  } catch (error) {
    console.error(`Erro ao buscar indicadores para localidade ${localidadeId}:`, error);
    // Retorna array vazio em caso de erro geral
    return [];
  }
}

export async function getLocalidadeFull(municipioId: string, categoria?: string) {
  try {
    // 1. Buscar info do município/estado/país
    const municipioInfo = getInfoMunicipio(municipioId);
    const estadoInfo = municipioInfo ? getEstadoDoMunicipio(municipioId) : undefined;
    const paisInfo = getInfoPais();

    if (!municipioInfo || !estadoInfo) {
      throw new Error(`Município ou estado não encontrado para ID: ${municipioId}`);
    }

    console.log(`Buscando dados para: Município ${municipioInfo.nome}, Estado ${estadoInfo.nome}`);

    // 2. Buscar indicadores de cada nível com tratamento individual de erros
    const [municipioIndicadores, estadoIndicadores, paisIndicadores] = await Promise.allSettled([
      getIndicadoresParaLocalidade(municipioId, categoria),
      getIndicadoresParaLocalidade(estadoInfo.id, categoria),
      getIndicadoresParaLocalidade(paisInfo.id, categoria)
    ]);

    // 3. Extrair resultados ou usar arrays vazios em caso de erro
    const municipioData = municipioIndicadores.status === 'fulfilled' ? municipioIndicadores.value : [];
    const estadoData = estadoIndicadores.status === 'fulfilled' ? estadoIndicadores.value : [];
    const paisData = paisIndicadores.status === 'fulfilled' ? paisIndicadores.value : [];

    // Log de erros se houver
    if (municipioIndicadores.status === 'rejected') {
      console.error('Erro ao buscar indicadores do município:', municipioIndicadores.reason);
    }
    if (estadoIndicadores.status === 'rejected') {
      console.error('Erro ao buscar indicadores do estado:', estadoIndicadores.reason);
    }
    if (paisIndicadores.status === 'rejected') {
      console.error('Erro ao buscar indicadores do país:', paisIndicadores.reason);
    }

    // 4. Montar payload final
    return {
      municipio: {
        id: municipioInfo.id,
        nome: municipioInfo.nome,
        uf: estadoInfo.sigla,
        indicadores: municipioData,
      },
      estado: {
        id: estadoInfo.id,
        nome: estadoInfo.nome,
        sigla: estadoInfo.sigla,
        indicadores: estadoData,
      },
      pais: {
        id: paisInfo.id,
        nome: paisInfo.nome,
        sigla: paisInfo.sigla,
        indicadores: paisData,
      }
    };
  } catch (error) {
    console.error('Erro em getLocalidadeFull:', error);
    throw error;
  }
}