// src/store/useLatencyStore.ts
import { create } from 'zustand';

export type LatenciaItem = {
  total: number;
  backend: number;
  rede: number;
  timestamp: string;
};

type LatencyState = {
  historico: LatenciaItem[];
  ultima: LatenciaItem | null;
  registrar: (item: LatenciaItem) => void;
};

export const useLatencyStore = create<LatencyState>((set) => ({
  historico: [],
  ultima: null,
  registrar: (item) =>
    set((state) => ({
      ultima: item,
      historico: [...state.historico.slice(-4), item],
    })),
}));
