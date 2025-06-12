// src/store/hooks/useSelecionado.ts
import { usePreferencesStore } from '../preferencesStore';
import type { Selecionado } from '@/types';

export function useSelecionado(): [
  Partial<Selecionado>,
  (s: Partial<Selecionado>) => void
] {
  const selecionado = usePreferencesStore((state) => state.selecionado);
  const setSelecionado = usePreferencesStore((state) => state.setSelecionado);

  return [selecionado, setSelecionado];
}
