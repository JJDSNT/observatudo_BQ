// src/store/useUserPreferences.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserPreferences } from '@/types';

interface UserPreferencesStore {
  preferences: UserPreferences;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  clearPreferences: () => void;
}

export const useUserPreferences = create<UserPreferencesStore>()(
  persist(
    (set) => ({
      preferences: {},
      setPreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),
      clearPreferences: () => set({ preferences: {} }),
    }),
    {
      name: 'user-preferences-storage', // chave no localStorage
    }
  )
);
