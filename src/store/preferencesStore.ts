//src/store/preferencesStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DebugModules,
  LocalizacaoSelecionada,
  DebugConfig,
  CategoriaIndicador,
} from '@/types';
import { CATEGORIAS_DEFAULT } from '@/data/categoriasIndicadores';

interface PreferencesStore {
  tema: 'claro' | 'escuro' | 'auto';
  selecionado: LocalizacaoSelecionada;
  debug: DebugConfig;
  categoriasIndicadores: CategoriaIndicador[];

  setTema: (tema: 'claro' | 'escuro' | 'auto') => void;
  setSelecionado: (s: LocalizacaoSelecionada) => void;
  setDebug: (debug: DebugConfig) => void;
  setDebugModule: (mod: keyof DebugModules, val: boolean) => void;
  setCategoriasIndicadores: (categorias: CategoriaIndicador[]) => void;
  initializeDefaultsIfNeeded: () => void;
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set, get) => ({
      tema: 'auto',
      selecionado: { cidade: '', estado: '', eixo: 0 },
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
