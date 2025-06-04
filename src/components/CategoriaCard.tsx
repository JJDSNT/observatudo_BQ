// src/components/CategoriaCard.tsx
"use client";

import { IconSelector, LucideIconName } from "./IconSelector";
import { SubeixoCard } from "./SubeixoCard";
import { CategoriaIndicador } from "@/types/categorias-indicadores";

interface CategoriaCardProps {
  categoria: CategoriaIndicador;
  iconesDisponiveis: LucideIconName[];
  onUpdate: (id: number, atualizacao: Partial<CategoriaIndicador>) => void;
  onUpdateSubeixo: (
    categoriaId: number,
    subeixoId: string,
    novoNome: string
  ) => void;
  onAddSubeixo: (categoriaId: number) => void;
  onRemoveSubeixo: (categoriaId: number, subeixoId: string) => void;
  onRemoveIndicador: (
    categoriaId: number,
    subeixoId: string,
    indicadorId: string
  ) => void;
  onDelete: (id: number) => void;
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
}: Readonly<CategoriaCardProps>) {
  return (
    <div className="relative border rounded-xl p-4 shadow space-y-4 bg-white dark:bg-zinc-900">
      <button
        onClick={() => onDelete(categoria.id)}
        className="absolute top-2 right-2 text-sm text-red-600 hover:text-red-800 cursor-pointer"
        title="Remover categoria"
        aria-label="Remover categoria"
      >
        ×
      </button>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <IconSelector
            value={categoria.icone}
            onChange={(icon) => onUpdate(categoria.id, { icone: icon })}
            icons={iconesDisponiveis}
          />
          <span className="font-semibold text-lg">
            {categoria.subeixos[0]?.nome ?? `Categoria ${categoria.id}`}
          </span>
        </div>

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
                nome={subeixo.nome}
                indicadores={subeixo.indicadores}
                onRemoveIndicador={(indicadorId) =>
                  onRemoveIndicador(categoria.id, subeixo.id, indicadorId)
                }
              />
            </div>
          ))}
        </div>

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
