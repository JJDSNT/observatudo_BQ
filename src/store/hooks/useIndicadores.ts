import { usePreferencesStore } from '../preferencesStore';
import { useIndicadoresStore } from '../indicadoresCacheStore';
import type { IndicadoresPayload } from '@/types';

/**
 * Hook que retorna os indicadores da localidade selecionada.
 * Útil para componentes que já assumem que os dados estão disponíveis em cache.
 */
export function useIndicadores(): IndicadoresPayload | undefined {
  const selecionado = usePreferencesStore((s) => s.selecionado);
  const getPayload = useIndicadoresStore((s) => s.getPayload);

  const estado = selecionado?.estado?.trim();
  const cidade = selecionado?.cidade?.trim();

  if (!estado || !cidade) return undefined;

  return getPayload(estado, cidade);
}
