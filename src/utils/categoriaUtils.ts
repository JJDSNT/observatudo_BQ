// src/utils/categoriaUtils.ts
import { CategoriaIndicador, Subeixo } from '@/types/categorias';
import { LucideIconName } from '@/components/IconSelector';

export function criarSubeixoPadrao(categoriaId: number): Subeixo {
  return {
    id: `sub-${categoriaId}-${crypto.randomUUID()}`,
    nome: 'Novo subeixo',
    indicadores: [],
  };
}

export function criarCategoriaPadrao(): CategoriaIndicador {
  const timestamp = Date.now();
  return {
    id: timestamp,
    cor: '#000000',
    icone: 'Circle' as LucideIconName,
    subeixos: [criarSubeixoPadrao(timestamp)],
  };
}
