// src/hooks/useIndicadoresSelecionados.ts
"use client";

import { useEffect, useState } from "react";
import { usePreferencesStore } from "@/store/preferencesStore";
import { useIndicadoresStore } from "@/store/indicadoresCacheStore";
import { fetchIndicadoresParaSelecionado } from "@/services/fetchIndicadores";
import type {
  IndicadoresPayload,
  Categoria
} from "@/types";

export function useIndicadoresSelecionados(fetchIfMissing = false) {
  const selecionado = usePreferencesStore((s) => s.selecionado);
  const categorias = usePreferencesStore((s) => s.categoriasIndicadores);

  const { getPayload, setPayload } = useIndicadoresStore();

  const { pais, estado, cidade, categoriaId } = selecionado ?? {};

  const categoria: Categoria | undefined = categorias?.find(
    (c) => c.id === categoriaId
  );

  const payload: IndicadoresPayload | undefined = getPayload();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (
      !fetchIfMissing ||
      !pais ||
      !estado ||
      !cidade ||
      categoriaId === undefined ||
      !categoria
    )
      return;

    const jaTem = getPayload();
    if (jaTem) return;

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const dados = await fetchIndicadoresParaSelecionado(
          { pais, estado, cidade },
          categoriaId,
          categoria
        );
        setPayload(dados);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Erro desconhecido ao buscar indicadores"
        );
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [
    fetchIfMissing,
    pais,
    estado,
    cidade,
    categoriaId,
    categoria,
    getPayload,
    setPayload,
  ]);

  // NOVO: retorno direto do payload
  return {
    indicadores: payload,
    loading,
    error,
  };
}
