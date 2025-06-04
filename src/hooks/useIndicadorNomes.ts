// src/hooks/useIndicadorNomes.ts
'use client';

import { useEffect, useMemo, useState } from 'react';

type IndicadorNome = { id: string; nome: string };

export function useIndicadorNomes(indicadorIds: string[]) {
  const [mapa, setMapa] = useState<Map<string, string>>(new Map());

  const idsOrdenados = useMemo(() => {
    return Array.from(new Set(indicadorIds))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [indicadorIds]);

  useEffect(() => {
    if (idsOrdenados.length === 0) return;

    const fetchNomes = async () => {
      try {
        const res = await fetch('/api/indicadores/nomeados', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: idsOrdenados }),
        });

        const dados: IndicadorNome[] = await res.json();
        setMapa(new Map(dados.map((d) => [d.id, d.nome])));
      } catch (err) {
        console.error('❌ Erro ao buscar nomes dos indicadores:', err);
      }
    };

    fetchNomes();
  }, [JSON.stringify(idsOrdenados)]); // garante dependência estável e evita re-renders infinitos

  return mapa;
}
