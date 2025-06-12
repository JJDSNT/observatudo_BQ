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

  setLocalidade: (loc: {
    pais: string;
    estado: string;
    cidade: string;
  }) => void;

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
        pais: "",
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

      setLocalidade: ({ pais, estado, cidade }) =>
        set((state) => ({
          selecionado: {
            ...state.selecionado,
            pais,
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
        const { categoriasIndicadores, selecionado } = get();

        // 🔥 Remove campo legado 'eixo'
        if ("eixo" in selecionado) {
          const novo = { ...selecionado };
          delete novo.eixo;
          set({ selecionado: novo });
        }

        // ✅ Garante que categoria esteja carregada
        if (
          !Array.isArray(categoriasIndicadores) ||
          categoriasIndicadores.length === 0
        ) {
          console.warn("⚠️ Nenhuma categoria encontrada. Usando padrão.");
          set({ categoriasIndicadores: CATEGORIAS_DEFAULT });
        }

        // ✅ Se o país estiver ausente, define como 'BR' (sem mexer nos outros)
        if (!selecionado?.pais) {
          console.info("ℹ️ País ausente. Definindo 'BR' como padrão.");
          set((state) => ({
            selecionado: {
              ...state.selecionado,
              pais: "BR",
            },
          }));
        }

        // 👁️ Estado, cidade e categoria agora são responsabilidade do usuário (ou persistência anterior)
        if (!selecionado?.estado || !selecionado?.cidade) {
          console.info("ℹ️ Estado ou cidade ausente. Aguardando interação.");
        }

        if (!selecionado?.categoriaId) {
          console.info("ℹ️ Categoria ausente. Aguardando interação.");
        }
      },
    }),
    {
      name: "user-preferences-storage",
    }
  )
);
