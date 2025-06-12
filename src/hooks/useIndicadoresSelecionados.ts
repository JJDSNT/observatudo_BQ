// src/hooks/useIndicadoresSelecionados.ts
"use client";

import { useEffect, useState } from "react";
import { usePreferencesStore } from "@/store/preferencesStore";
import { useIndicadoresStore } from "@/store/indicadoresCacheStore";
import { fetchIndicadoresParaSelecionado } from "@/services/fetchIndicadores";
import type { IndicadoresPayload } from "@/types";

export function useIndicadoresSelecionados(fetchIfMissing = false) {
  const selecionado = usePreferencesStore((s) => s.selecionado);
  const categorias = usePreferencesStore((s) => s.categoriasIndicadores);
  const userId = "usuario"; // 🔐 Substituir futuramente por ID real

  const { getPayload, setPayload } = useIndicadoresStore();

  const { pais, estado, cidade } = selecionado ?? {};
  const cacheKey = `${userId}::${pais}::${estado}::${cidade}`;
  const payload: IndicadoresPayload | undefined = getPayload(cacheKey);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.groupCollapsed("🧩 useIndicadoresSelecionados");
    console.log("🔍 fetchIfMissing:", fetchIfMissing);
    console.log("🌍 Localidade:", { pais, estado, cidade });
    console.log("🗝️ cacheKey:", cacheKey);
    console.log("📦 payload existente:", payload);
    console.log("📚 categorias:", categorias?.length);

    if (!fetchIfMissing || !pais || !estado || !cidade || !categorias?.length) {
      console.log("🚫 Condições não atendidas para buscar indicadores");
      console.groupEnd();
      return;
    }

    if (payload) {
      console.log("✅ Já há payload em cache. Nenhuma requisição necessária.");
      console.groupEnd();
      return;
    }

    const fetch = async () => {
      setLoading(true);
      setError(null);
      console.log("📡 Buscando indicadores para TODAS as categorias...");
      try {
        const dados = await fetchIndicadoresParaSelecionado(
          { pais, estado, cidade },
          categorias
        );
        console.log("✅ Indicadores recebidos:", dados);
        setPayload(cacheKey, dados);
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Erro desconhecido ao buscar indicadores";
        console.error("❌ Erro ao buscar indicadores:", msg);
        setError(msg);
      } finally {
        setLoading(false);
        console.groupEnd();
      }
    };

    fetch();
  }, [
    fetchIfMissing,
    pais,
    estado,
    cidade,
    categorias,
    payload,
    cacheKey,
    getPayload,
    setPayload,
  ]);

  return {
    indicadores: payload,
    loading,
    error,
  };
}
