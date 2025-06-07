// src/store/types/preferences.ts

export interface DebugModules {
  pwa: boolean;
  zustand: boolean;
  latency: boolean;
}

export interface DebugConfig {
  enabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  persistLogs: boolean;
  maxLogEntries: number;
  modules: DebugModules;
}

export interface LocalizacaoSelecionada {
  cidade: string;
  estado: string;
  eixo: number;
}

export interface CategoriaIndicador {
  id: number;
  cor: string;
  icone: string;
  subeixos: Array<{
    id: string;
    nome: string;
    indicadores: string[];
  }>;
}

export interface UserPreferences {
  localizacao: LocalizacaoSelecionada;
  debug: DebugConfig;
  categoriasIndicadores: CategoriaIndicador[];
  tema: 'claro' | 'escuro' | 'auto';
  _meta: {
    version: number;
    createdAt: number;
    lastUpdated: number;
    migratedFrom?: string[];
  };
}
