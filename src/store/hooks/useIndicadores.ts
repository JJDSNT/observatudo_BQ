// src/store/hooks/useIndicadores.ts
import { usePreferencesStore } from '../preferencesStore';
import { useIndicadoresStore } from '../indicadoresCacheStore';
import type { IndicadoresPayload } from '@/types';

/**
 * Hook que retorna os indicadores da localidade selecionada.
 * Útil para componentes que já assumem que os dados estão disponíveis em cache.
 */
export function useIndicadores(): IndicadoresPayload | undefined {
  const localizacao = usePreferencesStore((s) => s.localizacao);
  const getPayload = useIndicadoresStore((s) => s.getPayload);

  const estado = localizacao?.estado?.trim();
  const cidade = localizacao?.cidade?.trim();

  if (!estado || !cidade) return undefined;

  return getPayload(estado, cidade);
}
