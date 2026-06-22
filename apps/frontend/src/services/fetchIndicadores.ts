//src/services/fetchIndicadores.ts

import { useIndicadoresStore, generateIndicadoresKey } from "@/store/indicadoresCacheStore";
import { useAuthStore } from "@/store/authStore";
import type {
  Categoria,
  Indicador,
  IndicadoresPayload,
  SubeixoResultado,
  Localidade,
} from "@/types";

// Tipos auxiliares para sanitização
interface RawSeriePonto {
  data?: unknown;
  valor?: unknown;
  nota?: unknown;
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

// Sanitização
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
          nota: typeof p?.nota === "string" ? p.nota : null,
        }))
      : [],
  };
}

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
 * 🔄 Busca e armazena os indicadores para TODAS as categorias do usuário
 */
export async function fetchIndicadoresParaSelecionado(
  localidade: Localidade,
  categorias: Categoria[]
): Promise<IndicadoresPayload> {
  const store = useIndicadoresStore.getState();
  const userId = useAuthStore.getState().user?.uid || "usuario";
  const key = generateIndicadoresKey(userId, localidade.pais, localidade.estado, localidade.cidade);

  // 🔧 Enviando apenas os subeixos (como esperado pelo backend)
  const subeixosParaEnviar = categorias.flatMap((c) => c.subeixos);

  const res = await fetch(
    `/api/indicadores/localidade/${localidade.cidade}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subeixos: subeixosParaEnviar }),
    }
  );

  if (!res.ok) {
    throw new Error(`Erro ao buscar indicadores: HTTP ${res.status}`);
  }

  const json = await res.json();

  const payload: IndicadoresPayload = {
    localidade,
    atualizadoEm: new Date().toISOString(),
    niveis: {
      pais: [],
      estado: [],
      municipio: [],
    },
  };

  const subeixosDoNivel = (nivel: unknown, categoria: Categoria): SubeixoResultado[] => {
    const rawSubeixos: RawSubeixoResultado[] = Array.isArray(
      (nivel as { subeixos?: unknown })?.subeixos
    )
      ? ((nivel as { subeixos: RawSubeixoResultado[] }).subeixos).filter(
          (s) => categoria.subeixos.some((c) => c.id === s.id)
        )
      : [];

    return rawSubeixos.map(sanitizeSubeixoResultado);
  };

  for (const categoria of categorias) {
    payload.niveis.municipio.push({
      id: categoria.id,
      cor: categoria.cor,
      icone: categoria.icone,
      subeixos: subeixosDoNivel(json?.municipio, categoria),
    });

    payload.niveis.estado.push({
      id: categoria.id,
      cor: categoria.cor,
      icone: categoria.icone,
      subeixos: subeixosDoNivel(json?.estado, categoria),
    });

    payload.niveis.pais.push({
      id: categoria.id,
      cor: categoria.cor,
      icone: categoria.icone,
      subeixos: subeixosDoNivel(json?.pais, categoria),
    });
  }

  store.setPayload(key, payload);
  return payload;
}
