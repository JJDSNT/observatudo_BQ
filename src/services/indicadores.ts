import { QueryBuilder } from "@/lib/analytics/query";
import { IndicadorCivico } from "../lib/analytics/models/indicadorCivico";
import {
  getInfoMunicipio,
  getEstadoDoMunicipio,
  getInfoPais,
} from "../lib/analytics/localidadeUtils";

// Funções utilitárias que podem ser úteis em outros lugares
export async function getIndicadoresPorRegiao(
  categoria: string,
  regiao: string,
  periodo: { inicio: string; fim: string }
) {
  const query = IndicadorCivico.consultarPorRegiao(categoria, regiao, periodo);
  return await query.execute();
}

export async function getSerieHistorica(
  indicadorId: string,
  localIds: string[],
  anos: number = 5
) {
  const query = IndicadorCivico.serieHistorica(indicadorId, localIds, anos);
  return await query.execute();
}

export async function getRankingMunicipios(
  indicadorId: string,
  uf: string,
  ano: number,
  limit: number = 10
) {
  const query = new QueryBuilder("fact_indicadores", "f")
    .join("dim_localidades", "l", "f.localidade_id = l.id")
    .addDimension({ name: "municipio", sql: "l.nome", type: "string" })
    .addMeasure({ name: "valor", sql: "f.valor", type: "avg" })
    .filter({
      dimension: "f.indicador_id",
      operator: "=",
      values: [indicadorId],
    })
    .filter({ dimension: "l.tipo", operator: "=", values: ["municipio"] })
    .filter({ dimension: "l.regiao_maior", operator: "=", values: [uf] })
    .filter({
      dimension: "EXTRACT(YEAR FROM f.data_referencia)",
      operator: "=",
      values: [ano],
    })
    .orderBy("valor", "DESC")
    .limit(limit);

  return await query.execute();
}

// Função principal - busca indicadores por categorias para município, estado e país
export async function getLocalidadeFullPorCategorias(
  municipioId: string,
  categorias: { id: number; nome: string; indicadores: string[] }[]
) {
  console.group("📥 getLocalidadeFullPorCategorias");
  console.log("🔢 Categorias recebidas:", categorias);
  categorias.forEach((cat) => {
    console.log(`- ${cat.nome} (${cat.id}):`, cat.indicadores);
  });
  console.groupEnd();

  // Buscar informações das localidades
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

  // Função auxiliar para buscar indicadores de uma localidade
  const fetchIndicadoresPorLocalidade = async (localidadeId: string) => {
    return await Promise.all(
      categorias.map(async (categoria) => {
        const indicadores = await Promise.all(
          categoria.indicadores.map(async (indicadorId) => {
            try {
              const data = await IndicadorCivico.serieHistorica(
                indicadorId,
                [localidadeId],
                5
              ).execute();

              console.groupCollapsed(
                `📈 Indicador ${indicadorId} - Localidade ${localidadeId}`
              );
              console.log("📦 Série retornada:", data);
              console.log("🧾 Nome:", data[0]?.indicadorNome);
              console.log("🔹 Unidade:", data[0]?.unidade);
              console.log("🏷️ Fonte:", data[0]?.fonte);
              console.groupEnd();

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
          id: categoria.id,
          nome: categoria.nome,
          indicadores,
        };
      })
    );
  };

  // Buscar dados para todas as localidades em paralelo
  const [municipioCategorias, estadoCategorias, paisCategorias] =
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
      categorias: municipioCategorias,
    },
    estado: {
      id: estadoInfo.id,
      nome: estadoInfo.nome,
      sigla: estadoInfo.sigla,
      categorias: estadoCategorias,
    },
    pais: {
      id: paisInfo.id,
      nome: paisInfo.nome,
      sigla: paisInfo.sigla,
      categorias: paisCategorias,
    },
  };
}
