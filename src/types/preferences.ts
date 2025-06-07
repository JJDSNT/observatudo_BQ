// src/types/preferences.ts
import type { Categoria, Localidade } from '@/types';

export interface Selecionado extends Localidade {
  categoriaId?: number;
}

export interface DebugModules {
  pwa?: boolean;
  zustand?: boolean;
  latency?: boolean;
  latencyMonitor?: boolean;
}

export interface DebugConfig {
  enabled?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  persistLogs?: boolean;
  maxLogEntries?: number;
  modules?: DebugModules;
}

export interface UserPreferences {
  categoriasIndicadores?: Categoria[]; // Preferências disponíveis
  tema?: 'claro' | 'escuro' | 'auto';
  idioma?: 'pt-BR' | 'en-US';
  notificacoesAtivas?: boolean;
  selecionado?: Partial<Selecionado>; // Permite seleção parcial
  debug?: DebugConfig;
  _meta?: {
    version: number;
    createdAt: number;
    lastUpdated: number;
    migratedFrom?: string[];
  };
}
