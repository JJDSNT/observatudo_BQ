// src/store/types/indicadores.ts

export interface IndicadorValor {
  ano: number;
  valor: number | null;
}

export interface IndicadorSerie {
  id: string;
  nome: string;
  valores: IndicadorValor[];
}

export interface LocalidadeChave {
  cidade: string;
  estado: string;
  eixo: number;
}

// Pode usar JSON.stringify(localidade) como chave no cache
export type CacheIndicadores = Record<string, IndicadorSerie[]>;

