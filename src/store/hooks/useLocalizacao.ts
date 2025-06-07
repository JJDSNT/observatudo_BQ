// store/hooks/useLocalizacao.ts
import { usePreferencesStore } from '../preferencesStore';

export const useLocalizacao = () =>
  usePreferencesStore((state) => state.localizacao);
