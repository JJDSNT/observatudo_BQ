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

export const useUserPreferences = create<UserPreferencesStore>()(
  persist(
    (set, get) => ({
      preferences: {},
      setPreferences: (prefs) =>
        set((state) => ({
          preferences: {
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
        })),
      clearPreferences: () => set({ preferences: {} }),

      initializeDefaultsIfNeeded: () => {
        const { preferences } = get();
        if (
          !preferences.categoriasIndicadores ||
          preferences.categoriasIndicadores.length === 0
        ) {
          set((state) => ({
            preferences: {
              ...state.preferences,
              categoriasIndicadores: CATEGORIAS_DEFAULT,
            },
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
