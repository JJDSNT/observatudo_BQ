// src/utils/categoriaUtils.ts
import type { Categoria, Subeixo, LucideIconName } from "@/types";

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
export function criarCategoriaPadrao(): Categoria {
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
  categoria: Pick<Categoria, "subeixos">
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
  categoria: Partial<Categoria>
): LucideIconName {
  return categoria.icone ?? "Circle";
}

/**
 * Atualiza o nome de um subeixo dentro da categoria.
 */
export function atualizarNomeSubeixo(
  categoria: Categoria,
  subeixoId: string,
  novoNome: string
): Categoria {
  return {
    ...categoria,
    subeixos: categoria.subeixos.map((s) =>
      s.id === subeixoId ? { ...s, nome: novoNome } : s
    ),
  };
}

/**
 * Adiciona um novo subeixo padrão à categoria.
 */
export function adicionarSubeixo(categoria: Categoria): Categoria {
  return {
    ...categoria,
    subeixos: [...categoria.subeixos, criarSubeixoPadrao(categoria.id)],
  };
}

/**
 * Remove um subeixo da categoria pelo ID.
 */
export function removerSubeixo(
  categoria: Categoria,
  subeixoId: string
): Categoria {
  return {
    ...categoria,
    subeixos: categoria.subeixos.filter((s) => s.id !== subeixoId),
  };
}

/**
 * Remove um indicador específico de um subeixo da categoria.
 */
export function removerIndicador(
  categoria: Categoria,
  subeixoId: string,
  indicadorId: string
): Categoria {
  return {
    ...categoria,
    subeixos: categoria.subeixos.map((s) =>
      s.id === subeixoId
        ? {
            ...s,
            indicadores: s.indicadores.filter((id) => id !== indicadorId),
          }
        : s
    ),
  };
}
