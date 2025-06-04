// src/hooks/useCategoriasIndicadores.ts
'use client';

import { useUserPreferences } from './useUserPreferences';
import { CategoriaIndicador } from '@/types/categorias-indicadores';

export function useCategoriasIndicadores() {
  const { preferencias, updatePreferencias, loading, error } = useUserPreferences();

  const categoriasIndicadores: CategoriaIndicador[] =
    preferencias?.categoriasIndicadores ?? [];

  const setCategoriasIndicadores = (categorias: CategoriaIndicador[]) => {
    updatePreferencias({ categoriasIndicadores: categorias });
  };

  return {
    categoriasIndicadores,
    setCategoriasIndicadores,
    loading,
    error,
  };
}
