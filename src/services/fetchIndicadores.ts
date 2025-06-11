// src/services/fetchIndicadores.ts
import { getLocalidadeFullPorSubeixos } from "@/services/indicadores";
import { useIndicadoresStore } from "@/store/indicadoresCacheStore";
import type {
  Categoria,
  Indicador,
  IndicadoresPayload,
  SubeixoResultado,
  Localidade,
} from "@/types";

// 🏷️ Tipos para dados brutos da API
interface RawSeriePonto {
  data?: unknown;
  valor?: unknown;
}

interface RawIndicador {
  id: unknown;
  nome?: unknown;
  descricao?: unknown;
  unidade?: unknown;
  fonte?: unknown;
  periodicidade?: unknown;
  serie?: unknown;
}

interface RawSubeixoResultado {
  id: unknown;
  nome?: unknown;
  indicadores?: unknown;
}

// 🧼 Sanitiza um indicador bruto garantindo os tipos corretos
function sanitizeIndicador(raw: RawIndicador): Indicador {
  return {
    id: String(raw.id),
    nome: typeof raw.nome === "string" ? raw.nome : `Indicador ${raw.id}`,
    descricao: typeof raw.descricao === "string" ? raw.descricao : undefined,
    unidade: typeof raw.unidade === "string" ? raw.unidade : "",
    fonte: typeof raw.fonte === "string" ? raw.fonte : "",
    periodicidade:
      typeof raw.periodicidade === "string" ? raw.periodicidade : "",
    serie: Array.isArray(raw.serie)
      ? raw.serie.map((p: RawSeriePonto) => ({
          data: typeof p?.data === "string" ? p.data : "",
          valor: typeof p?.valor === "number" ? p.valor : null,
        }))
      : [],
  };
}

// 🧼 Sanitiza um subeixo completo com seus indicadores
function sanitizeSubeixoResultado(raw: RawSubeixoResultado): SubeixoResultado {
  return {
    id: String(raw.id),
    nome: typeof raw.nome === "string" ? raw.nome : "",
    indicadores: Array.isArray(raw.indicadores)
      ? raw.indicadores.map(sanitizeIndicador)
      : [],
  };
}

/**
 * 🔄 Busca e armazena os indicadores para a localidade e categoria selecionadas.
 */
export async function fetchIndicadoresParaSelecionado(
  localidade: Localidade,
  categoriaId: number,
  categoria: Categoria
): Promise<IndicadoresPayload> {
  const store = useIndicadoresStore.getState();

  const resposta = await getLocalidadeFullPorSubeixos(
    localidade.cidade,
    categoria.subeixos
  );

  const subeixos = Array.isArray(resposta?.municipio?.subeixos)
    ? resposta.municipio.subeixos.map(sanitizeSubeixoResultado)
    : [];

  const payload: IndicadoresPayload = {
    localidade,
    atualizadoEm: new Date().toISOString(),
    niveis: {
      pais: [
        {
          id: categoria.id,
          cor: categoria.cor,
          icone: categoria.icone,
          subeixos: [], // TODO: preencher quando disponível
        },
      ],
      estado: [
        {
          id: categoria.id,
          cor: categoria.cor,
          icone: categoria.icone,
          subeixos: [], // TODO: preencher quando disponível
        },
      ],
      municipio: [
        {
          id: categoria.id,
          cor: categoria.cor,
          icone: categoria.icone,
          subeixos,
        },
      ],
    },
  };

  store.setPayload(payload);

  return payload;
}
