// src/store/preferencesStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Categoria, DebugConfig, DebugModules, Selecionado } from "@/types";
import { CATEGORIAS_DEFAULT } from "@/data/categoriasIndicadores";

interface PreferencesStore {
  tema: "claro" | "escuro" | "auto";
  selecionado: Partial<Selecionado>;
  debug: DebugConfig;
  categoriasIndicadores: Categoria[];

  setLocalidade: (loc: { estado: string; cidade: string }) => void;

  setTema: (tema: "claro" | "escuro" | "auto") => void;
  setSelecionado: (s: Partial<Selecionado>) => void;
  setDebug: (debug: DebugConfig) => void;
  setDebugModule: (mod: keyof DebugModules, val: boolean) => void;
  setCategoriasIndicadores: (categorias: Categoria[]) => void;
  initializeDefaultsIfNeeded: () => void;
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set, get) => ({
      tema: "auto",
      selecionado: {
        estado: "",
        cidade: "",
        categoriaId: undefined,
      },
      debug: {
        enabled: false,
        logLevel: "warn",
        persistLogs: false,
        maxLogEntries: 100,
        zustand: false,
        latency: false,
        pwa: false,
        latencyMonitor: false,
      },
      categoriasIndicadores: [],

      setLocalidade: ({ estado, cidade }) =>
        set((state) => ({
          selecionado: {
            ...state.selecionado,
            estado,
            cidade,
          },
        })),

      setTema: (tema) => set({ tema }),

      setSelecionado: (novoSelecionado) =>
        set((state) => {
          const atual: Partial<Selecionado> = state.selecionado;
          const proximo: Partial<Selecionado> = {
            ...atual,
            ...novoSelecionado,
          };

          const mudou = Object.keys(proximo).some(
            (chave) =>
              proximo[chave as keyof Selecionado] !==
              atual[chave as keyof Selecionado]
          );

          if (!mudou) return state;

          return { selecionado: proximo };
        }),

      setDebug: (debug) => set({ debug }),

      setDebugModule: (mod, val) =>
        set((state) => ({
          debug: {
            ...state.debug,
            [mod]: val,
          },
        })),

      setCategoriasIndicadores: (categoriasIndicadores) => {
        if (
          !Array.isArray(categoriasIndicadores) ||
          categoriasIndicadores.length === 0
        ) {
          console.warn("⚠️ Nenhuma categoria informada. Restaurando padrão.");
          set({ categoriasIndicadores: CATEGORIAS_DEFAULT });
        } else {
          set({ categoriasIndicadores });
        }
      },

      initializeDefaultsIfNeeded: () => {
        const { categoriasIndicadores } = get();

        if (
          !Array.isArray(categoriasIndicadores) ||
          categoriasIndicadores.length === 0
        ) {
          console.warn("⚠️ Nenhuma categoria encontrada. Usando padrão.");
          set({ categoriasIndicadores: CATEGORIAS_DEFAULT });
        } else {
          console.log(
            "✅ categoriasIndicadores já estavam carregadas no Zustand."
          );
        }
      },
    }),
    {
      name: "user-preferences-storage",
    }
  )
);
