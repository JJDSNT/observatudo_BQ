// src/components/categorias/CategoriaCard.tsx
"use client";

import { Categoria, LucideIconName } from "@/types";
import { IconSelector } from "@/components/IconSelector";
import { SubeixoCard } from "@/components/categorias/SubeixoCard";
import { GripVertical } from "lucide-react"; // ✅ ícone de drag

interface CategoriaCardProps {
  categoria: Categoria;
  iconesDisponiveis: LucideIconName[];
  onUpdate: (id: number, atualizacao: Partial<Categoria>) => void;
  onUpdateSubeixo: (categoriaId: number, subeixoId: string, novoNome: string) => void;
  onAddSubeixo: (categoriaId: number) => void;
  onRemoveSubeixo: (categoriaId: number, subeixoId: string) => void;
  onRemoveIndicador: (categoriaId: number, subeixoId: string, indicadorId: string) => void;
  onDelete: (id: number) => void;
  getNome: (id: string) => string;
  loading?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>; // 👈 novo
}

export function CategoriaCard({
  categoria,
  iconesDisponiveis,
  onUpdate,
  onUpdateSubeixo,
  onAddSubeixo,
  onRemoveSubeixo,
  onRemoveIndicador,
  onDelete,
  getNome,
  loading = false,
  dragHandleProps,
}: Readonly<CategoriaCardProps>) {
  const nomeCategoria = new Intl.ListFormat("pt-BR", {
    style: "long",
    type: "conjunction",
  }).format(categoria.subeixos.map((s) => s.nome ?? "Subeixo"));

  return (
    <div className="relative border rounded-xl p-4 shadow space-y-4 bg-white dark:bg-zinc-900">
      {/* Botão remover categoria */}
      <button
        onClick={() => onDelete(categoria.id)}
        className="absolute top-2 right-2 text-sm text-red-600 hover:text-red-800 cursor-pointer"
        title="Remover categoria"
        aria-label="Remover categoria"
      >
        ×
      </button>

      <div className="space-y-2">
        {/* Header com ícone e nome */}
        <div className="flex items-center justify-between">
          <IconSelector
            value={categoria.icone}
            onChange={(icon) => onUpdate(categoria.id, { icone: icon })}
            icons={iconesDisponiveis}
          />

          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">{nomeCategoria}</span>
            {dragHandleProps && (
              <button
                {...dragHandleProps}
                className="cursor-grab text-zinc-400 hover:text-zinc-600"
                title="Arrastar categoria"
              >
                <GripVertical size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Cor da categoria */}
        <div className="text-sm flex items-center gap-2">
          Cor:
          <input
            type="color"
            value={categoria.cor}
            onChange={(e) => onUpdate(categoria.id, { cor: e.target.value })}
            className="w-8 h-6 border border-gray-300 rounded cursor-pointer"
          />
          <span>{categoria.cor}</span>
        </div>

        {/* Subeixos */}
        <div className="space-y-2">
          {categoria.subeixos.map((subeixo) => (
            <div key={subeixo.id} className="relative">
              <input
                value={subeixo.nome}
                onChange={(e) =>
                  onUpdateSubeixo(categoria.id, subeixo.id, e.target.value)
                }
                onFocus={(e) => {
                  if (e.target.value === "Novo subeixo") {
                    e.target.select();
                    onUpdateSubeixo(categoria.id, subeixo.id, "");
                  }
                }}
                className="w-full mb-1 px-2 py-1 border rounded text-sm bg-white dark:bg-zinc-800"
                placeholder="Nome do subeixo"
              />
              <button
                onClick={() => onRemoveSubeixo(categoria.id, subeixo.id)}
                className="absolute right-2 top-1 text-red-600 hover:text-red-800 text-sm cursor-pointer"
                title="Remover subeixo"
              >
                ×
              </button>
              <SubeixoCard
                id={subeixo.id}
                nome={subeixo.nome}
                indicadores={subeixo.indicadores}
                getNome={getNome}
                loading={loading}
                onRemoveIndicador={(indicadorId) =>
                  onRemoveIndicador?.(categoria.id, subeixo.id, indicadorId)
                }
                onUpdateNome={(novoNome) =>
                  onUpdateSubeixo?.(categoria.id, subeixo.id, novoNome)
                }
              />
            </div>
          ))}
        </div>

        {/* Adicionar subeixo */}
        <div className="flex justify-end">
          <button
            onClick={() => onAddSubeixo(categoria.id)}
            className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            + Adicionar subeixo
          </button>
        </div>
      </div>
    </div>
  );
}
