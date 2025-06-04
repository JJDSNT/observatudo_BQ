// src/hooks/useIndicadorNomes.ts 
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type IndicadorNome = { id: string; nome: string };

export function useIndicadorNomes(indicadorIds: string[]) {
  const [mapa, setMapa] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const idsOrdenados = useMemo(() => {
    return Array.from(new Set(indicadorIds))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [indicadorIds]);

  // Função para comparar arrays de forma profunda
  const idsString = useMemo(() => idsOrdenados.join(','), [idsOrdenados]);
  
  const fetchNomes = useCallback(async (ids: string[], signal: AbortSignal) => {
    try {
      setLoading(true);
      const res = await fetch('/api/indicadores/nomeados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
        signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const dados: IndicadorNome[] = await res.json();
      
      // Só atualiza se a requisição não foi cancelada
      if (!signal.aborted) {
        setMapa(new Map(dados.map((d) => [d.id, d.nome])));
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('🔄 Requisição cancelada (novo fetch iniciado)');
      } else {
        console.error('❌ Erro ao buscar nomes dos indicadores:', err);
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // Cancela requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (idsOrdenados.length === 0) {
      setMapa(new Map());
      setLoading(false);
      return;
    }

    // Cria novo AbortController para esta requisição
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    fetchNomes(idsOrdenados, signal);

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [idsOrdenados, idsString, fetchNomes]); // Usa idsString em vez de idsOrdenados

  // Limpa o AbortController quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { 
    mapa, 
    loading,
    // Helper function para buscar nome por ID
    getNome: useCallback((id: string) => mapa.get(id) || id, [mapa])
  };
}