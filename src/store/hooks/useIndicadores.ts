import { usePreferencesStore } from '../preferencesStore';
import { useIndicadoresStore } from '../indicadoresCacheStore';
import type { IndicadoresPayload } from '@/types';

export function useIndicadores(): IndicadoresPayload | undefined {
  const { estado, cidade } = usePreferencesStore((s) => s.localizacao);
  const getPayload = useIndicadoresStore((s) => s.getPayload);

  if (!estado || !cidade) return undefined;

  return getPayload(estado, cidade);
}
