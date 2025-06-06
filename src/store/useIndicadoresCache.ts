// src/store/useIndicadoresCache.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IndicadorCacheStore {
  indicadores: Record<string, any>;
  setIndicadores: (estado: string, cidade: string, categoria: string | number, payload: any) => void;
  getIndicadores: (estado: string, cidade: string, categoria: string | number) => any | undefined;
  clearIndicadores: () => void;
}

export const useIndicadoresCache = create<IndicadorCacheStore>()(
  persist(
    (set, get) => ({
      indicadores: {},

      setIndicadores: (estado, cidade, categoria, payload) => {
        const key = `${estado}_${cidade}_${categoria}`;
        set((state) => ({
          indicadores: {
            ...state.indicadores,
            [key]: payload
          }
        }));
      },

      getIndicadores: (estado, cidade, categoria) => {
        const key = `${estado}_${cidade}_${categoria}`;
        return get().indicadores[key];
      },

      clearIndicadores: () => set({ indicadores: {} })
    }),
    {
      name: 'indicadores-cache-v1'
    }
  )
);
