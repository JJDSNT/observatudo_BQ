// src/hooks/useCategoriasIndicadores.ts
"use client";

import { useUserPreferences } from "./useUserPreferences";
import { CategoriaIndicador } from "@/types";

export function useCategoriasIndicadores() {
  const { preferencias, updatePreferencias, loading, error } =
    useUserPreferences();

  const categoriasIndicadores: CategoriaIndicador[] | undefined =
    Array.isArray(preferencias?.categoriasIndicadores) &&
    preferencias.categoriasIndicadores.length > 0
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
