// src/types/categorias-indicadores.ts
import type { LucideIconName } from "@/components/IconSelector";

export interface Subeixo {
  id: string;
  nome: string;
  indicadores: string[];
}

export interface CategoriaIndicador {
  id: number;
  cor: string;
  icone: LucideIconName;
  subeixos: Subeixo[];
}
