"use client";

import React, { useState, useEffect } from "react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Subeixo = {
  id: string;
  nome: string;
  indicadores: string[];
};

type EixoTematico = {
  id: number;
  cor: string;
  icone: string; // ex: "Globe", "Heart"
  subeixos: Subeixo[];
};

type CategoriaSelectorProps = {
  eixos: EixoTematico[];
  onCategoriaChange: (indicadores: string[]) => void;
};

export default function CategoriaSelector({
  eixos,
  onCategoriaChange,
}: Readonly<CategoriaSelectorProps>) {
  const [eixoSelecionado, setEixoSelecionado] = useState<number | null>(null);

  useEffect(() => {
    const eixo = eixos.find((e) => e.id === eixoSelecionado);
    const indicadores = eixo
      ? eixo.subeixos.flatMap((s) => s.indicadores)
      : [];
    onCategoriaChange(indicadores);
  }, [eixoSelecionado, eixos, onCategoriaChange]);

  const formatarNome = (subeixos: Subeixo[]) => {
    const nomes = subeixos.map((s) => s.nome);
    if (nomes.length === 1) return nomes[0];
    return nomes.slice(0, -1).join(", ") + " & " + nomes[nomes.length - 1];
  };

  return (
    <div className="flex flex-wrap gap-3">
      {eixos.map((eixo) => {
        const Icon = (LucideIcons[eixo.icone as keyof typeof LucideIcons] ??
          LucideIcons.LayoutGrid) as LucideIcon;
        const isActive = eixo.id === eixoSelecionado;
        const nomeEixo = formatarNome(eixo.subeixos);

        return (
          <button
            key={eixo.id}
            onClick={() =>
              setEixoSelecionado(isActive ? null : eixo.id)
            }
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition cursor-pointer ${
              isActive
                ? "text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            style={{
              backgroundColor: isActive ? eixo.cor : undefined,
              borderColor: isActive ? eixo.cor : "#ccc",
            }}
          >
            <Icon size={16} style={{ color: isActive ? "white" : eixo.cor }} />
            {nomeEixo}
          </button>
        );
      })}
    </div>
  );
}
