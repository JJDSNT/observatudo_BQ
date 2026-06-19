// src/types/indicadores-model.ts
import type { LucideIconName } from '@/types/lucide-icons';
import type { Localidade } from '@/types';

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
  localidade: Localidade; // já no formato { pais, estado, cidade }
  atualizadoEm: string; // ISO string
    niveis: {
    pais: CategoriaResultado[];
    estado: CategoriaResultado[];
    municipio: CategoriaResultado[];
  };
}

export interface CategoriaResultado {
  id: number;
  cor: string;
  icone: LucideIconName;
  subeixos: SubeixoResultado[];
}
