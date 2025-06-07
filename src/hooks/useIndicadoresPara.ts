// src/hooks/useIndicadoresPara.ts
'use client';

import { useEffect, useState } from 'react';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useIndicadoresStore } from '@/store/indicadoresCacheStore';
import { fetchIndicadoresParaSelecionado } from '@/services/fetchIndicadores';
import type { IndicadoresPayload, CategoriaIndicador } from '@/types';

/**
 * Hook que retorna os indicadores agrupados por eixo para a localidade selecionada.
 * Opcionalmente realiza o fetch caso não estejam em cache.
 */
export function useIndicadoresPara(fetchIfMissing = false) {
  const selecionado = usePreferencesStore((s) => s.selecionado);
  const categorias = usePreferencesStore((s) => s.categoriasIndicadores);

  const getPayload = useIndicadoresStore((s) => s.getPayload);
  const setPayload = useIndicadoresStore((s) => s.setPayload);

  const estado = selecionado?.estado?.trim();
  const cidade = selecionado?.cidade?.trim();
  const categoriaId = selecionado?.eixo;

  const categoria: CategoriaIndicador | undefined = categorias?.find(
    (c) => c.id === categoriaId
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payload: IndicadoresPayload | null =
    estado && cidade && categoriaId !== undefined
      ? getPayload(estado, cidade) ?? null
      : null;

  useEffect(() => {
    if (!fetchIfMissing || !estado || !cidade || categoriaId === undefined || !categoria) return;

    const jaTem = getPayload(estado, cidade);
    if (jaTem) return;

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const dados = await fetchIndicadoresParaSelecionado(
          estado,
          cidade,
          categoriaId,
          categoria
        );
        setPayload(estado, cidade, dados);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido ao buscar indicadores');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [fetchIfMissing, estado, cidade, categoriaId, categoria, getPayload, setPayload]);

  return {
    indicadores: payload,
    loading,
    error,
  };
}
