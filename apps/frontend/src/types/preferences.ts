// src/types/preferences.ts
import type { Categoria, Localidade } from '@/types';

export interface Selecionado extends Localidade {
  categoriaId?: number;
}

export interface DebugConfig {
  enabled?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  persistLogs?: boolean;
  maxLogEntries?: number;

  // flat structure
  zustand?: boolean;
  latency?: boolean;
  pwa?: boolean;
  latencyMonitor?: boolean;
}

export type DebugModules = Pick<DebugConfig, 'zustand' | 'pwa' | 'latency' | 'latencyMonitor'>;

export interface UserPreferences {
  categoriasIndicadores?: Categoria[];
  tema?: 'claro' | 'escuro' | 'auto';
  idioma?: 'pt-BR' | 'en-US';
  notificacoesAtivas?: boolean;
  selecionado?: Partial<Selecionado>;
  debug?: DebugConfig;
  _meta?: {
    version: number;
    createdAt: number;
    lastUpdated: number;
    migratedFrom?: string[];
  };
}
