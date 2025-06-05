// src/utils/categoriaUtils.ts
import type { CategoriaIndicador, Subeixo, LucideIconName } from "@/types";

/**
 * Cria um novo subeixo com nome padrão e ID único.
 */
export function criarSubeixoPadrao(categoriaId: number): Subeixo {
  return {
    id: `sub-${categoriaId}-${crypto.randomUUID()}`,
    nome: "Novo subeixo",
    indicadores: [],
  };
}

/**
 * Cria uma nova categoria com valores padrão.
 */
export function criarCategoriaPadrao(): CategoriaIndicador {
  const timestamp = Date.now();
  return {
    id: timestamp,
    cor: "#000000",
    icone: "Circle",
    subeixos: [criarSubeixoPadrao(timestamp)],
  };
}

/**
 * Formata os nomes dos subeixos de uma categoria em uma string legível.
 * Ex: "Educação, Saúde & Segurança"
 */
export function formatarNomeCategoria(
  categoria: Pick<CategoriaIndicador, "subeixos">
): string {
  const nomes = categoria.subeixos.map((s) => s.nome);
  return nomes.length <= 1
    ? nomes[0] ?? ""
    : nomes.slice(0, -1).join(", ") + " & " + nomes[nomes.length - 1];
}

/**
 * Retorna o ícone de uma categoria ou um fallback padrão.
 */
export function obterIconeCategoria(
  categoria: Partial<CategoriaIndicador>
): LucideIconName {
  return categoria.icone ?? "Circle";
}
