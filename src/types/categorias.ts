// src/types/categorias.ts
import type { Subeixo } from "@/types/indicadores";
import type { LucideIconName } from "@/components/IconSelector";

export interface CategoriaIndicador {
  id: number;
  cor: string;
  icone: LucideIconName;
  subeixos: Subeixo[];
}


