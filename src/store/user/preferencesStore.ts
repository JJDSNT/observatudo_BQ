// src/store/user/preferencesStore.ts

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type { UserPreferences } from '../types/preferences';
import { MigrationService } from '../services/migrationService';
import { LoggerService } from '@/lib/loggerService';

interface PreferencesStore {
  preferences: UserPreferences;

  // Atualizações genéricas e específicas
  updatePreferences: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  setTema: (tema: UserPreferences['tema']) => void;
  setCategorias: (categorias: UserPreferences['categoriasIndicadores']) => void;

  // Estado de erro (opcional)
  lastError: string | null;
  clearError: () => void;
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    subscribeWithSelector((set, get) => ({
      preferences: MigrationService.createDefaultPreferences(),
      lastError: null,

      updatePreferences: (key, value) => {
        try {
          set((state) => ({
            preferences: {
              ...state.preferences,
              [key]: value,
              _meta: {
                ...state.preferences._meta,
                lastUpdated: Date.now()
              }
            }
          }));

          LoggerService.log('info', 'PREFERENCES', `Atualizado ${key}`, { key, value });
        } catch (error) {
          const msg = `Erro ao atualizar ${key}: ${error}`;
          set({ lastError: msg });
          LoggerService.setError(msg, 'PREFERENCES', { key, value });
        }
      },

      setTema: (tema) => get().updatePreferences('tema', tema),
      setCategorias: (categorias) => get().updatePreferences('categoriasIndicadores', categorias),

      clearError: () => set({ lastError: null })
    })),
    {
      name: 'preferences-v3',
      version: 3,

      migrate: (persistedState: any, version: number) => {
        if (MigrationService.needsMigration(persistedState)) {
          const migrated = MigrationService.migrateLegacyPreferences(persistedState);
          LoggerService.log('info', 'MIGRATION', 'Preferências migradas automaticamente');
          return { preferences: migrated, lastError: null };
        }
        return persistedState;
      },

      onRehydrateStorage: () => (state) => {
        if (state?.preferences?.debug) {
          LoggerService.configure({
            enabled: state.preferences.debug.enabled,
            logLevel: state.preferences.debug.logLevel,
            maxEntries: state.preferences.debug.maxLogEntries
          });
          LoggerService.log('info', 'LOGGER', 'Logger reconfigurado após hidratação');
        }
      }
    }
  )
);
