
import { IndicadorCivico } from "../lib/analytics/models/indicadorCivico";
import {
  getInfoMunicipio,
  getEstadoDoMunicipio,
  getInfoPais,
} from "../lib/analytics/localidadeUtils";

export async function getIndicadoresPorRegiao(
  categoria: string,
  regiao: string,
  periodo: { inicio: string; fim: string }
) {
  const query = IndicadorCivico.consultarPorRegiao(categoria, regiao, periodo);
  return await query.execute();
}


// Função principal - busca indicadores por subeixos para município, estado e país
export async function getLocalidadeFullPorSubeixos(
  municipioId: string,
  subeixos: { id: string; nome: string; indicadores: string[] }[]
) {
  console.group("📥 getLocalidadeFullPorSubeixos");
  console.log("🔢 Subeixos recebidos:", subeixos);
  subeixos.forEach((s) => {
    console.log(`- ${s.nome} (${s.id}):`, s.indicadores);
  });
  console.groupEnd();

  const municipioInfo = getInfoMunicipio(municipioId);
  const estadoInfo = municipioInfo
    ? getEstadoDoMunicipio(municipioId)
    : undefined;
  const paisInfo = getInfoPais();

  if (!municipioInfo || !estadoInfo) {
    throw new Error(
      `Município ou estado não encontrado para ID: ${municipioId}`
    );
  }

  const fetchIndicadoresPorLocalidade = async (localidadeId: string) => {
    return await Promise.all(
      subeixos.map(async (subeixo) => {
        const indicadores = await Promise.all(
          subeixo.indicadores.map(async (indicadorId) => {
            try {
              const data = await IndicadorCivico.serieHistorica(
                indicadorId,
                [localidadeId]
              ).execute();

              return {
                id: indicadorId,
                nome: data[0]?.indicadorNome ?? `Indicador ${indicadorId}`,
                unidade: data[0]?.unidade ?? "",
                fonte: data[0]?.fonte ?? "",
                serie: data.map((d) => ({
                  data: d.data,
                  valor: d.valor,
                })),
              };
            } catch (error) {
              console.error(
                `❌ Erro ao buscar indicador ${indicadorId} para localidade ${localidadeId}:`,
                error
              );
              return {
                id: indicadorId,
                nome: `Indicador ${indicadorId}`,
                unidade: "",
                fonte: "",
                serie: [],
              };
            }
          })
        );

        return {
          id: subeixo.id,
          nome: subeixo.nome,
          indicadores,
        };
      })
    );
  };

  const [municipioSubeixos, estadoSubeixos, paisSubeixos] =
    await Promise.all([
      fetchIndicadoresPorLocalidade(municipioId),
      fetchIndicadoresPorLocalidade(estadoInfo.id),
      fetchIndicadoresPorLocalidade(paisInfo.id),
    ]);

  return {
    municipio: {
      id: municipioInfo.id,
      nome: municipioInfo.nome,
      uf: estadoInfo.sigla,
      subeixos: municipioSubeixos,
    },
    estado: {
      id: estadoInfo.id,
      nome: estadoInfo.nome,
      sigla: estadoInfo.sigla,
      subeixos: estadoSubeixos,
    },
    pais: {
      id: paisInfo.id,
      nome: paisInfo.nome,
      sigla: paisInfo.sigla,
      subeixos: paisSubeixos,
    },
  };
}
