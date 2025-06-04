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
    icone: 'Circle',
    subeixos: [criarSubeixoPadrao(timestamp)],
  };
}

export function normalizarCategoriasJson(
  categorias: Partial<CategoriaIndicador>[]
): CategoriaIndicador[] {
  return categorias.map((cat, index) => ({
    id: cat.id ?? index + 1,
    cor: cat.cor ?? '#000000',
    icone: (cat.icone ?? 'Circle') as LucideIconName,
    subeixos: (cat.subeixos ?? []).map((s) => ({
      id: s.id,
      nome: s.nome,
      indicadores: s.indicadores ?? [],
    })),
  }));
}
