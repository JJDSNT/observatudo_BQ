// src/hooks/useIndicadoresPara.ts
'use client';

import { useEffect, useState } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useIndicadoresStore } from '@/store/useIndicadoresStore';
// 🔧 Certifique-se que este path está correto
import { fetchIndicadores } from '@/lib/api/fetchIndicadores';

export function useIndicadoresPara(fetchIfMissing = false) {
  const { preferencias } = useUserPreferences();
  const { getIndicadores, setIndicadores } = useIndicadoresStore();

  const estado = preferencias?.selecionado?.estado?.trim();
  const cidade = preferencias?.selecionado?.cidade?.trim();
  const categoriaId = preferencias?.selecionado?.eixo;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payload =
    estado && cidade && categoriaId !== undefined
      ? getIndicadores(estado, cidade, String(categoriaId)) ?? null
      : null;

  useEffect(() => {
    if (!fetchIfMissing || !estado || !cidade || categoriaId === undefined) return;

    const jaTem = getIndicadores(estado, cidade, String(categoriaId));
    if (jaTem) return;

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchIndicadores(estado, cidade, String(categoriaId));
        setIndicadores(estado, cidade, String(categoriaId), result ?? {});
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
  }, [fetchIfMissing, estado, cidade, categoriaId, getIndicadores, setIndicadores]);

  return {
    indicadores: payload,
    loading,
    error,
  };
}
