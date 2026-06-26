// src/services/indicadores.ts

/**
 * ⚠️ Este módulo é de uso estritamente server-side.
 * Ele acessa diretamente o BigQuery via lib/analytics e deve ser usado apenas em rotas de API.
 */

import {
  IndicadorCivico,
  type PontoSerieIndicador,
} from "@/lib/analytics/models/indicadorCivico";
import {
  getInfoMunicipio,
  getEstadoDoMunicipio,
  getInfoPais,
} from "@/lib/analytics/localidadeUtils";

/**
 * 🔒 Server-only: deve ser usado apenas por rotas de API.
 * Retorna os indicadores estruturados para município, estado e país.
 */
export async function getLocalidadeFullPorSubeixos(
  municipioId: string,
  subeixos: { id: string; nome: string; indicadores: string[] }[]
) {
  const municipioInfo = getInfoMunicipio(municipioId);
  const estadoInfo = municipioInfo
    ? getEstadoDoMunicipio(municipioId)
    : undefined;
  const paisInfo = getInfoPais();

  if (!municipioInfo || !estadoInfo) {
    throw new Error(`Município ou estado não encontrado para ID: ${municipioId}`);
  }

  const localidadeIds = [municipioId, estadoInfo.id, paisInfo.id];
  const indicadorIds = Array.from(
    new Set(subeixos.flatMap((s) => s.indicadores))
  );

  // Uma única consulta ao Cube.js pra todos os indicadores x localidades
  // dessa página, em vez de uma consulta por indicador (era o que o
  // BigQuery direto fazia antes).
  const pontos = await IndicadorCivico.serieHistoricaBatch(
    indicadorIds,
    localidadeIds
  );

  const porIndicadorELocalidade = new Map<string, PontoSerieIndicador[]>();
  for (const ponto of pontos) {
    const chave = `${ponto.indicadorId}::${ponto.localidadeId}`;
    const serie = porIndicadorELocalidade.get(chave) ?? [];
    serie.push(ponto);
    porIndicadorELocalidade.set(chave, serie);
  }

  const montarSubeixos = (localidadeId: string) =>
    subeixos.map((subeixo) => ({
      id: subeixo.id,
      nome: subeixo.nome,
      indicadores: subeixo.indicadores.map((indicadorId) => {
        const serie =
          porIndicadorELocalidade.get(`${indicadorId}::${localidadeId}`) ?? [];
        const primeiro = serie[0];

        return {
          id: indicadorId,
          nome: primeiro?.indicadorNome ?? `Indicador ${indicadorId}`,
          descricao: primeiro?.descricao || undefined,
          formula: primeiro?.formula || undefined,
          unidade: primeiro?.unidade ?? "",
          fonte: primeiro?.fonte ?? "",
          serie: serie.map((p) => ({ data: p.data, valor: p.valor, nota: p.nota })),
        };
      }),
    }));

  return {
    municipio: {
      id: municipioInfo.id,
      nome: municipioInfo.nome,
      uf: estadoInfo.sigla,
      subeixos: montarSubeixos(municipioId),
    },
    estado: {
      id: estadoInfo.id,
      nome: estadoInfo.nome,
      sigla: estadoInfo.sigla,
      subeixos: montarSubeixos(estadoInfo.id),
    },
    pais: {
      id: paisInfo.id,
      nome: paisInfo.nome,
      sigla: paisInfo.sigla,
      subeixos: montarSubeixos(paisInfo.id),
    },
  };
}
