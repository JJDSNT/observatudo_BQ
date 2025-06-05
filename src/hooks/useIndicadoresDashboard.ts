// src/hooks/useIndicadoresDashboard.ts
import useSWR from 'swr';
import { LocalidadeFullResponse, Subeixo } from '@/types/indicadores';

const fetcherPost = async (
  url: string,
  body: Subeixo[]
): Promise<LocalidadeFullResponse> => {
  console.groupCollapsed('📊 useIndicadoresDashboard');
  console.log('📡 Enviando POST para:', url);
  console.log('📚 Subeixos:', body);

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ categorias: body }),
  });

  if (!res.ok) {
    const error = new Error(`Erro HTTP ${res.status}`);
    console.error('❌ Erro ao buscar indicadores:', error);
    console.groupEnd();
    throw error;
  }

  const json: LocalidadeFullResponse = await res.json();
  console.log('✅ Resposta recebida:', json);
  console.groupEnd();
  return json;
};

export function useIndicadoresDashboard(
  municipioId: string,
  subeixos?: Subeixo[]
) {
  const shouldFetch = municipioId && subeixos && subeixos.length > 0;

  const { data, error, isLoading } = useSWR<LocalidadeFullResponse>(
    shouldFetch ? [`/api/indicadores/localidade/${municipioId}`, subeixos] : null,
    ([url, body]: [string, Subeixo[]]) => fetcherPost(url, body),
    {
      revalidateOnFocus: false,
      dedupingInterval: 12 * 60 * 60 * 1000, // 12 horas
    }
  );

  return {
    data,
    error,
    loading: isLoading,
  };
}
