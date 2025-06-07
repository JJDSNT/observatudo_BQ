// store/hooks/useCategorias.ts
import { usePreferencesStore } from '../preferencesStore';

export const useCategorias = () =>
  usePreferencesStore((state) => state.categoriasIndicadores);
