// src/store/useUserPreferences.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserPreferences } from "@/types";
import { CATEGORIAS_DEFAULT } from "@/data/categoriasIndicadores";

interface UserPreferencesStore {
  preferences: UserPreferences;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  clearPreferences: () => void;
  initializeDefaultsIfNeeded: () => void;
}

function wrapWithLegacyAccessLogger<T extends object>(obj: T, legacyFields: string[]): T {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      if (typeof prop === "string" && legacyFields.includes(prop)) {
        const stack = new Error().stack?.split("\n").slice(2).join("\n") ?? "(stack trace indisponível)";
        console.warn(`🧯 Acesso dinâmico ao campo legado: "${prop}"
🔍 Stack:\n${stack}`);
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}

const LEGACY_FIELDS = [
  "estadoSelecionado",
  "cidadeSelecionada",
  "eixoSelecionado",
  "debugPwa",
  "debugZustand",
  "debugLatency",
];

export const useUserPreferences = create<UserPreferencesStore>()(
  persist(
    (set, get) => ({
      preferences: wrapWithLegacyAccessLogger({}, LEGACY_FIELDS),
      setPreferences: (prefs) =>
        set((state) => ({
          preferences: wrapWithLegacyAccessLogger(
            {
              ...state.preferences,
              ...prefs,
              selecionado: {
                ...state.preferences.selecionado,
                ...prefs.selecionado,
              },
              debug: {
                ...state.preferences.debug,
                ...prefs.debug,
              },
            },
            LEGACY_FIELDS
          ),
        })),
      clearPreferences: () => set({ preferences: wrapWithLegacyAccessLogger({}, LEGACY_FIELDS) }),

      initializeDefaultsIfNeeded: () => {
        const { preferences } = get();
        if (
          !preferences.categoriasIndicadores ||
          preferences.categoriasIndicadores.length === 0
        ) {
          set((state) => ({
            preferences: wrapWithLegacyAccessLogger(
              {
                ...state.preferences,
                categoriasIndicadores: CATEGORIAS_DEFAULT,
              },
              LEGACY_FIELDS
            ),
          }));
          console.log("ℹ️ categoriasIndicadores default carregadas no Zustand.");
        }
      },
    }),
    {
      name: "user-preferences-storage",
    }
  )
);
