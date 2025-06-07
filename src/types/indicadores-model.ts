// src/types/indicadores-model.ts
import type { LucideIconName } from '@/types/lucide-icons';
import type { Localizacao } from '@types/location';

// --- Indicadores
export interface ValorSerie {
  data: string; // "2022-01-01" ou apenas ano, se preferir
  valor: number | null;
}

export interface Indicador {
  id: string;
  nome: string;
  descricao?: string;
  unidade?: string;
  fonte?: string;
  periodicidade?: string;
  serie: ValorSerie[];
}

// --- Subeixos
export interface Subeixo {
  id: string;
  nome: string;
  indicadores: string[]; // apenas os IDs
}

export interface SubeixoResultado {
  id: string;
  nome: string;
  indicadores: Indicador[]; // dados completos
}

// --- Categorias
export interface Categoria {
  id: number;
  cor: string;
  icone: LucideIconName;
  subeixos: Subeixo[];
}

// --- Localidade e Payloads
export interface LocalidadePayload {
  id: string;
  nome: string;
  sigla?: string;
  uf?: string;
  subeixos: SubeixoResultado[];
}

export interface LocalidadeFullResponse {
  municipio: LocalidadePayload;
  estado: LocalidadePayload;
  pais: LocalidadePayload;
}

// --- Cache
export interface IndicadoresPayload {
  categoriaId: number;
  localizacao: Localizacao;
  subeixos: SubeixoResultado[];
  atualizadoEm: string; // ISO string (ex: "2025-06-05T22:14:00Z")
}
