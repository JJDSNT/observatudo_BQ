// src/services/fetchIndicadores.ts
import { getLocalidadeFullPorSubeixos } from './indicadores';
import { useIndicadoresStore } from '@/store/useIndicadoresStore';
import type {
  CategoriaIndicador,
  Indicador,
  IndicadoresPayload,
  SubeixoResultado,
} from '@/types/indicadores-model';

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
    nome: typeof raw.nome === 'string' ? raw.nome : `Indicador ${raw.id}`,
    descricao: typeof raw.descricao === 'string' ? raw.descricao : undefined,
    unidade: typeof raw.unidade === 'string' ? raw.unidade : '',
    fonte: typeof raw.fonte === 'string' ? raw.fonte : '',
    periodicidade: typeof raw.periodicidade === 'string' ? raw.periodicidade : '',
    serie: Array.isArray(raw.serie)
      ? raw.serie.map((p: RawSeriePonto) => ({
          data: typeof p?.data === 'string' ? p.data : '',
          valor: typeof p?.valor === 'number' ? p.valor : null,
        }))
      : [],
  };
}

// 🧼 Sanitiza um subeixo completo com seus indicadores
function sanitizeSubeixoResultado(raw: RawSubeixoResultado): SubeixoResultado {
  return {
    id: String(raw.id),
    nome: typeof raw.nome === 'string' ? raw.nome : '',
    indicadores: Array.isArray(raw.indicadores)
      ? raw.indicadores.map(sanitizeIndicador)
      : [],
  };
}

/**
 * 🔄 Busca e armazena os indicadores para a localidade e categoria selecionadas.
 */
export async function fetchIndicadoresParaSelecionado(
  estadoId: string,
  cidadeId: string,
  categoriaId: number,
  categoria: CategoriaIndicador
) {
  const store = useIndicadoresStore.getState();
  const resposta = await getLocalidadeFullPorSubeixos(
    cidadeId,
    categoria.subeixos
  );
  const subeixos = Array.isArray(resposta?.municipio?.subeixos)
    ? resposta.municipio.subeixos.map(sanitizeSubeixoResultado)
    : [];
  const payload: IndicadoresPayload = {
    categoriaId,
    estadoId,
    cidadeId,
    atualizadoEm: new Date().toISOString(),
    subeixos,
  };
  store.setIndicadores(estadoId, cidadeId, String(categoriaId), payload);
}