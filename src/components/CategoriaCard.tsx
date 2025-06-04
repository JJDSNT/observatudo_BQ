// src/components/CategoriaCard.tsx
"use client";

import { cn } from "@/lib/utils";
import { IconSelector, LucideIconName } from "./IconSelector";
import { SubeixoCard } from "./SubeixoCard";
import { CategoriaIndicador } from "@/types/categorias-indicadores";

interface CategoriaCardProps {
  categoria: CategoriaIndicador;
  iconesDisponiveis: LucideIconName[];
  onUpdate: (id: number, atualizacao: Partial<CategoriaIndicador>) => void;
  onUpdateSubeixo: (categoriaId: number, subeixoId: string, novoNome: string) => void;
  onRemoveIndicador: (categoriaId: number, subeixoId: string, indicadorId: string) => void;
}

export function CategoriaCard({
  categoria,
  iconesDisponiveis,
  onUpdate,
  onUpdateSubeixo,
  onRemoveIndicador,
}: Readonly<CategoriaCardProps>) {
  return (
    <div className="border rounded-xl p-4 shadow space-y-4 bg-white dark:bg-zinc-900">
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
            className="w-8 h-6 border border-gray-300 rounded"
          />
          <span>{categoria.cor}</span>
        </div>

        <div className="space-y-2">
          {categoria.subeixos.map((subeixo) => (
            <div key={subeixo.id}>
              <input
                value={subeixo.nome}
                onChange={(e) =>
                  onUpdateSubeixo(categoria.id, subeixo.id, e.target.value)
                }
                className="w-full mb-1 px-2 py-1 border rounded text-sm bg-white dark:bg-zinc-800"
                placeholder="Nome do subeixo"
              />
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
      </div>
    </div>
  );
}
