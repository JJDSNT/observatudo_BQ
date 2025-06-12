// src/store/hooks/useIndicadores.ts
import { usePreferencesStore } from "../preferencesStore";
import { useIndicadoresStore, generateIndicadoresKey } from "../indicadoresCacheStore";
import { useAuthStore } from "../authStore";
import type { IndicadoresPayload } from "@/types";

/**
 * Hook que retorna os indicadores da localidade selecionada.
 * Útil para componentes que já assumem que os dados estão disponíveis em cache.
 */
export function useIndicadores(): IndicadoresPayload | undefined {
  const selecionado = usePreferencesStore((s) => s.selecionado);
  const userId = useAuthStore((s) => s.user?.uid ?? "anon");
  const getPayload = useIndicadoresStore((s) => s.getPayload);

  const { pais, estado, cidade } = selecionado ?? {};
  if (!pais || !estado || !cidade) return undefined;

  const key = generateIndicadoresKey(userId, pais, estado, cidade);
  return getPayload(key);
}
