// src/hooks/useCategoriasPreferidas.ts
"use client";

import { useUserPreferences } from "./useUserPreferences";
import { CategoriaIndicador } from "@/types";

/**
 * 🎯 Hook para gerenciar as categorias personalizadas definidas pelo usuário.
 * Utiliza `useUserPreferences` para persistência local.
 */
export function useCategoriasPreferidas() {
  const { preferencias, updatePreferencias, loading, error } = useUserPreferences();

  const categoriasIndicadores: CategoriaIndicador[] | undefined =
    Array.isArray(preferencias?.categoriasIndicadores) && preferencias.categoriasIndicadores.length > 0
      ? preferencias.categoriasIndicadores
      : undefined;

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
