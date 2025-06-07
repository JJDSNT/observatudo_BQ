// store/hooks/useTema.ts
import { usePreferencesStore } from '../preferencesStore';

export const useTema = () =>
  usePreferencesStore((state) => state.tema);
