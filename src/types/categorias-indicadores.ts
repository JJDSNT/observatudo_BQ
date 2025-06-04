// src/types/categorias-indicadores.ts
export interface CategoriaIndicador {
  id: number;
  cor: string;
  icone: string;
  subeixos: {
    id: string;
    nome: string;
    indicadores: string[];
  }[];
}
