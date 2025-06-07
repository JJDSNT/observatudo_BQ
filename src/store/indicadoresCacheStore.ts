// src/store/indicadoresCacheStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IndicadoresPayload } from '@/types';

interface IndicadoresStore {
  indicadoresPorLocalidade: Record<string, IndicadoresPayload>;

  setPayload: (
    estadoId: string,
    cidadeId: string,
    payload: IndicadoresPayload
  ) => void;

  getPayload: (
    estadoId: string,
    cidadeId: string
  ) => IndicadoresPayload | undefined;

  clearPayload: (
    estadoId?: string,
    cidadeId?: string
  ) => void;
}

function generateKey(estadoId: string, cidadeId: string): string {
  return `${estadoId}::${cidadeId}`;
}

export const useIndicadoresStore = create<IndicadoresStore>()(
  persist(
    (set, get) => ({
      indicadoresPorLocalidade: {},

      setPayload: (estadoId, cidadeId, payload) => {
        const key = generateKey(estadoId, cidadeId);
        set((state: IndicadoresStore) => ({
          indicadoresPorLocalidade: {
            ...state.indicadoresPorLocalidade,
            [key]: payload,
          },
        }));
      },

      getPayload: (estadoId, cidadeId) => {
        const key = generateKey(estadoId, cidadeId);
        return get().indicadoresPorLocalidade[key];
      },

      clearPayload: (estadoId, cidadeId) => {
        if (!estadoId || !cidadeId) {
          set(() => ({ indicadoresPorLocalidade: {} }));
        } else {
          const key = generateKey(estadoId, cidadeId);
          set((state: IndicadoresStore) => {
            const novoCache = { ...state.indicadoresPorLocalidade };
            delete novoCache[key];
            return { indicadoresPorLocalidade: novoCache };
          });
        }
      },
    }),
    {
      name: 'indicadores-store',
      version: 1,
    }
  )
);
