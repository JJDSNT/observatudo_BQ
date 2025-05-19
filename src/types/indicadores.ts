// types/indicadores.ts
import { Categoria } from "./categorias";

export type CategoriaComIndicadores = Categoria & {
  indicadores: {
    id: string;
    nome: string;
    unidade: string;
    fonte: string;
    serie: { data: string; valor: number | null }[];
  }[];
};

export interface ValorSerie {
  data: string;   // "2022-01-01" ou ano simples, se preferir
  valor: number;
}

export interface Indicador {
  id: string;
  nome: string;
  unidade: string;
  fonte: string;
  serie: ValorSerie[];
}

export interface LocalidadePayload {
  id: string;
  nome: string;
  sigla?: string;        // Opcional para municípios (útil para estado e país)
  uf?: string;           // Opcional: sigla do estado para municípios
  categorias: CategoriaComIndicadores[];
}

export interface LocalidadeFullResponse {
  municipio: LocalidadePayload;
  estado: LocalidadePayload;
  pais: LocalidadePayload;
}
