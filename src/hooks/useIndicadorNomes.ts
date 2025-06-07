// src/hooks/useIndicadorNomes.ts
'use client';

import useSWRImmutable from 'swr/immutable';
import { useMemo } from 'react';
import type { Indicador } from '@/types';

async function fetchIndicadorNomes(ids: string[]): Promise<Map<string, string>> {
  const res = await fetch('/api/indicadores/nomeados', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!res.ok) {
    throw new Error(`Erro ${res.status} ao buscar nomes dos indicadores`);
  }

  const dados: Indicador[] = await res.json();
  return new Map(dados.map((d) => [d.id, d.nome]));
}

export function useIndicadorNomes(indicadorIds: string[]) {
  const idsOrdenados = useMemo(
    () =>
      Array.from(new Set(indicadorIds))
        .filter((id): id is string => Boolean(id))
        .sort((a, b) => a.localeCompare(b)),
    [indicadorIds]
  );

  const dedupKey = idsOrdenados.join(',');

  const { data: mapa, isLoading, error } = useSWRImmutable(
    idsOrdenados.length > 0 ? ['/api/indicadores/nomeados', dedupKey] : null,
    () => fetchIndicadorNomes(idsOrdenados),
    {
      dedupingInterval: 60 * 60 * 1000, // 1 hora
    }
  );

  const nomePorId = mapa ?? new Map<string, string>();

  return {
    mapa: nomePorId,
    loading: isLoading,
    error,
    getNome: (id: string) => nomePorId.get(id) ?? id,
  };
}

export type GetNomeIndicadorFn = (id: string) => string;
