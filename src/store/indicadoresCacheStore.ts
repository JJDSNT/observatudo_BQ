// src/store/indicadoresCacheStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IndicadoresPayload } from '@/types';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useAuthStore } from '@/store/authStore';

interface IndicadoresStore {
  indicadoresPorLocalidade: Record<string, IndicadoresPayload>;
  setPayload: (payload: IndicadoresPayload) => void;
  getPayload: (key?: string) => IndicadoresPayload | undefined;
  clearPayload: (key?: string) => void;
}

// 🔑 Exportado para uso externo
export function generateIndicadoresKey(
  userId: string,
  pais: string,
  estado: string,
  cidade: string
): string {
  return `${userId}::${pais}::${estado}::${cidade}`;
}

// 🔄 Usa o Zustand para recuperar o estado atual e gerar a chave
export function generateIndicadoresKeyFromState(): string | null {
  const userId = useAuthStore.getState().user?.uid;
  const { pais, estado, cidade } = usePreferencesStore.getState().selecionado ?? {};
  if (!userId || !pais || !estado || !cidade) return null;
  return generateIndicadoresKey(userId, pais, estado, cidade);
}

export const useIndicadoresStore = create<IndicadoresStore>()(
  persist(
    (set, get) => ({
      indicadoresPorLocalidade: {},

      setPayload: (payload) => {
        const userId = useAuthStore.getState().user?.uid;
        const { pais, estado, cidade } = payload.localidade;
        if (!userId || !pais || !estado || !cidade) return;

        const key = generateIndicadoresKey(userId, pais, estado, cidade);
        set((state) => ({
          indicadoresPorLocalidade: {
            ...state.indicadoresPorLocalidade,
            [key]: payload,
          },
        }));
      },

      getPayload: (key) => {
        const finalKey = key ?? generateIndicadoresKeyFromState();
        if (!finalKey) return undefined;
        return get().indicadoresPorLocalidade[finalKey];
      },

      clearPayload: (key) => {
        if (!key) {
          set(() => ({ indicadoresPorLocalidade: {} }));
        } else {
          set((state) => {
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
