// src/store/useIndicadoresStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IndicadoresPayload } from "@/types";

interface IndicadoresState {
  indicadoresPorLocalidade: {
    [estadoId: string]: {
      [cidadeId: string]: {
        [categoriaId: string]: IndicadoresPayload;
      };
    };
  };
  setIndicadores: (
    estadoId: string,
    cidadeId: string,
    categoriaId: string | number,
    payload: IndicadoresPayload
  ) => void;
  getIndicadores: (
    estadoId: string,
    cidadeId: string,
    categoriaId: string | number
  ) => IndicadoresPayload | undefined;
  clearIndicadores: () => void;
}

export const useIndicadoresStore = create<IndicadoresState>()(
  persist(
    (set, get) => ({
      indicadoresPorLocalidade: {},

      setIndicadores: (estadoId, cidadeId, categoriaId, payload) =>
        set((state) => {
          const cidStr = categoriaId.toString();
          const estado = state.indicadoresPorLocalidade[estadoId] ?? {};
          const cidade = estado[cidadeId] ?? {};
          return {
            indicadoresPorLocalidade: {
              ...state.indicadoresPorLocalidade,
              [estadoId]: {
                ...estado,
                [cidadeId]: {
                  ...cidade,
                  [cidStr]: payload,
                },
              },
            },
          };
        }),

      getIndicadores: (estadoId, cidadeId, categoriaId) =>
        get().indicadoresPorLocalidade?.[estadoId]?.[cidadeId]?.[categoriaId.toString()],

      clearIndicadores: () => set({ indicadoresPorLocalidade: {} }),
    }),
    {
      name: "indicadores-store",
      version: 1,
    }
  )
);
