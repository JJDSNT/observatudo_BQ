import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DebugModules,
  LocalizacaoSelecionada,
  DebugConfig,
  CategoriaIndicador,
} from './types/preferences';
import { CATEGORIAS_DEFAULT } from '@/data/categoriasIndicadores';

interface PreferencesStore {
  tema: 'claro' | 'escuro' | 'auto';
  localizacao: LocalizacaoSelecionada;
  debug: DebugConfig;
  categoriasIndicadores: CategoriaIndicador[];

  setTema: (tema: 'claro' | 'escuro' | 'auto') => void;
  setLocalizacao: (loc: LocalizacaoSelecionada) => void;
  setDebug: (debug: DebugConfig) => void;
  setDebugModule: (mod: keyof DebugModules, val: boolean) => void;
  setCategoriasIndicadores: (categorias: CategoriaIndicador[]) => void;
  initializeDefaultsIfNeeded: () => void;
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set, get) => ({
      tema: 'auto',
      localizacao: { cidade: '', estado: '', eixo: 0 },
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
      setLocalizacao: (localizacao) => set({ localizacao }),
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
      setCategoriasIndicadores: (categoriasIndicadores) => set({ categoriasIndicadores }),

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
