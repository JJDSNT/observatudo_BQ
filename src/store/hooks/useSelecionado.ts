// store/hooks/useSelecionado.ts
import { usePreferencesStore } from '../preferencesStore';

export const useSelecionado = () =>
  usePreferencesStore((state) => state.selecionado);
