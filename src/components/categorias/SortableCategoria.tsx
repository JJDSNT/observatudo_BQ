// src/components/categorias/SortableCategoria.tsx
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CategoriaCard } from "@/components/categorias/CategoriaCard";
import type { Categoria, LucideIconName } from "@/types";
import type { GetNomeIndicadorFn } from "@/hooks/useIndicadorNomes";

interface SortableCategoriaProps {
  categoria: Categoria;
  iconesDisponiveis: LucideIconName[];
  onUpdate: (id: number, atualizacao: Partial<Categoria>) => void;
  onUpdateSubeixo: (categoriaId: number, subeixoId: string, novoNome: string) => void;
  onRemoveIndicador: (categoriaId: number, subeixoId: string, indicadorId: string) => void;
  onDelete: (id: number) => void;
  onAddSubeixo: (categoriaId: number) => void;
  onRemoveSubeixo: (categoriaId: number, subeixoId: string) => void;
  getNome: GetNomeIndicadorFn;
  loading: boolean;
}

export function SortableCategoria({
  categoria,
  iconesDisponiveis,
  onUpdate,
  onUpdateSubeixo,
  onRemoveIndicador,
  onDelete,
  onAddSubeixo,
  onRemoveSubeixo,
  getNome,
  loading,
}: Readonly<SortableCategoriaProps>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: categoria.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <CategoriaCard
        categoria={categoria}
        iconesDisponiveis={iconesDisponiveis}
        onUpdate={onUpdate}
        onUpdateSubeixo={onUpdateSubeixo}
        onRemoveIndicador={onRemoveIndicador}
        onDelete={onDelete}
        onAddSubeixo={onAddSubeixo}
        onRemoveSubeixo={onRemoveSubeixo}
        getNome={getNome}
        loading={loading}
        dragHandleProps={listeners} // 👈 usado no botão de arrastar
      />
    </div>
  );
}
