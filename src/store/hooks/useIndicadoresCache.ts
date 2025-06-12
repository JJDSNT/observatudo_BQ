// src/hooks/useIndicadoresCache.ts
'use client';

import { useIndicadoresStore, generateIndicadoresKey } from '@/store/indicadoresCacheStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useAuthStore } from '@/store/authStore';
import type { IndicadoresPayload } from '@/types';

export function useIndicadoresCache() {
  const userId = useAuthStore((s) => s.user?.uid);
  const selecionado = usePreferencesStore((s) => s.selecionado);

  const store = useIndicadoresStore();

  const key = userId && selecionado?.pais && selecionado.estado && selecionado.cidade
    ? generateIndicadoresKey(userId, selecionado.pais, selecionado.estado, selecionado.cidade)
    : null;

  const payload = key ? store.getPayload(key) : undefined;

  const set = (payload: IndicadoresPayload) => {
    if (key) store.setPayload(key, payload);
  };

  const clear = () => {
    if (key) store.clearPayload(key);
  };

  return {
    key,
    payload,
    set,
    clear,
  };
}
