// src/store/preferencesStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Categoria,
  DebugConfig,
  DebugModules,
  Selecionado,
} from '@/types';
import { CATEGORIAS_DEFAULT } from '@/data/categoriasIndicadores';

interface PreferencesStore {
  tema: 'claro' | 'escuro' | 'auto';
  selecionado: Partial<Selecionado>;
  debug: DebugConfig;
  categoriasIndicadores: Categoria[];

  setTema: (tema: 'claro' | 'escuro' | 'auto') => void;
  setSelecionado: (s: Partial<Selecionado>) => void;
  setDebug: (debug: DebugConfig) => void;
  setDebugModule: (mod: keyof DebugModules, val: boolean) => void;
  setCategoriasIndicadores: (categorias: Categoria[]) => void;
  initializeDefaultsIfNeeded: () => void;
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set, get) => ({
      tema: 'auto',
      selecionado: {
        estado: '',
        cidade: '',
        categoriaId: undefined,
      },
      debug: {
        enabled: false,
        logLevel: 'warn',
        persistLogs: false,
        maxLogEntries: 100,
        modules: {
          pwa: false,
          zustand: false,
          latency: false,
        },
      },
      categoriasIndicadores: [],

      setTema: (tema) => set({ tema }),
      setSelecionado: (selecionado) => set({ selecionado }),
      setDebug: (debug) => set({ debug }),
      setDebugModule: (mod, val) =>
        set((state) => ({
          debug: {
            ...state.debug,
            modules: {
              ...state.debug.modules,
              [mod]: val,
            },
          },
        })),
      setCategoriasIndicadores: (categoriasIndicadores) =>
        set({ categoriasIndicadores }),

      initializeDefaultsIfNeeded: () => {
        const { categoriasIndicadores } = get();
        if (!categoriasIndicadores || categoriasIndicadores.length === 0) {
          set({ categoriasIndicadores: CATEGORIAS_DEFAULT });
          console.log('ℹ️ categoriasIndicadores default carregadas no Zustand.');
        }
      },
    }),
    {
      name: 'user-preferences-storage',
    }
  )
);
