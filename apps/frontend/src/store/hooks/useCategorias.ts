// src/store/hooks/useCategorias.ts
import { usePreferencesStore } from '../preferencesStore';
import type { Categoria } from '@/types';

export function useCategorias(): [
  Categoria[],
  (categorias: Categoria[]) => void
] {
  const categorias = usePreferencesStore((s) => s.categoriasIndicadores);
  const setCategorias = usePreferencesStore((s) => s.setCategoriasIndicadores);

  return [categorias, setCategorias];
}
