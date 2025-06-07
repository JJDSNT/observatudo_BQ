// src/types/preferences.ts
import type { CategoriaIndicador } from './indicadores-model';

export interface LocalizacaoSelecionada {
  estado?: string;
  cidade?: string;
  eixo?: number;
  subeixos?: string[];
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
  categoriasIndicadores?: CategoriaIndicador[];
  tema?: 'claro' | 'escuro' | 'auto';
  idioma?: 'pt-BR' | 'en-US';
  notificacoesAtivas?: boolean;
  selecionado?: LocalizacaoSelecionada;
  debug?: DebugConfig;
  _meta?: {
    version: number;
    createdAt: number;
    lastUpdated: number;
    migratedFrom?: string[];
  };
}
