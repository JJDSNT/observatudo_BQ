// src/store/useUserPreferences.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserPreferences, CategoriaIndicador } from '@/types';
import { CATEGORIAS_INDICADORES } from '@/data/categoriasIndicadores';

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
          preferences: { ...state.preferences, ...prefs },
        })),
      clearPreferences: () => set({ preferences: {} }),

      initializeDefaultsIfNeeded: () => {
        const { preferences } = get();
        if (!preferences.categoriasIndicadores || preferences.categoriasIndicadores.length === 0) {
          set((state) => ({
            preferences: {
              ...state.preferences,
              categoriasIndicadores: CATEGORIAS_INDICADORES as CategoriaIndicador[],
            },
          }));
          console.log('ℹ️ categoriasIndicadores default carregadas no Zustand.');
        }
      },
    }),
    {
      name: 'user-preferences-storage',
    }
  )
);
