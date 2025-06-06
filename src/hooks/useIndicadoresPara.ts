// src/hooks/useIndicadoresPara.ts
// src/hooks/useIndicadoresPara.ts
'use client';

import { useEffect, useState } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useIndicadoresStore } from '@/store/useIndicadoresStore';
import { fetchIndicadoresParaSelecionado } from '@/services/fetchIndicadores';
import type { CategoriaIndicador } from '@/types';

export function useIndicadoresPara(fetchIfMissing = false) {
  const { preferencias } = useUserPreferences();
  const store = useIndicadoresStore();

  const estado = preferencias?.selecionado?.estado?.trim();
  const cidade = preferencias?.selecionado?.cidade?.trim();
  const categoriaId = preferencias?.selecionado?.eixo;
  
  const categoria = preferencias?.categoriasIndicadores?.find((c: CategoriaIndicador) => c.id === categoriaId);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payload =
    estado && cidade && categoriaId !== undefined
      ? store.getIndicadores(estado, cidade, String(categoriaId)) ?? null
      : null;

  useEffect(() => {
    if (!fetchIfMissing || !estado || !cidade || categoriaId === undefined || !categoria) return;

    const jaTem = store.getIndicadores(estado, cidade, String(categoriaId));
    if (jaTem) return;

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchIndicadoresParaSelecionado(estado, cidade, categoriaId, categoria);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Erro desconhecido ao buscar indicadores');
        }
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [fetchIfMissing, estado, cidade, categoriaId, categoria, store]);

  return {
    indicadores: payload,
    loading,
    error,
  };
}