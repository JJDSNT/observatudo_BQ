// src/components/CategoriaSelector.tsx
"use client";

import React, { useState, useEffect } from "react";
import * as LucideIcons from "lucide-react";
import { useSelecionado } from "@/store/hooks/useSelecionado";
import { usePreferencesStore } from "@/store/preferencesStore";
import { formatarNomeCategoria } from "@/utils/categoriaUtils";
import type { Categoria, Subeixo } from "@/types";

type CategoriaSelectorProps = {
  eixos: Categoria[];
  onCategoriaChange: (subeixos: Subeixo[]) => void;
};

export default function CategoriaSelector({
  eixos,
  onCategoriaChange,
}: Readonly<CategoriaSelectorProps>) {
  const [selecionado, setSelecionado] = useSelecionado();
  const setCategoriasIndicadores = usePreferencesStore((s) => s.setCategoriasIndicadores);
  const [categoriaSelecionadaId, setCategoriaSelecionadaId] = useState<number | undefined>(
    selecionado.categoriaId
  );

  useEffect(() => {
    const eixo = eixos.find((e) => e.id === categoriaSelecionadaId);
    const subeixosSelecionados = eixo?.subeixos ?? [];

    const categoriasIndicadores =
      categoriaSelecionadaId !== undefined && eixo
        ? [
            {
              id: categoriaSelecionadaId,
              cor: eixo.cor,
              icone: eixo.icone,
              subeixos: subeixosSelecionados,
            },
          ]
        : [];

    setSelecionado({
      ...selecionado,
      categoriaId: categoriaSelecionadaId,
    });

    setCategoriasIndicadores(categoriasIndicadores);
    onCategoriaChange(subeixosSelecionados);
  }, [categoriaSelecionadaId, eixos, selecionado, setSelecionado, setCategoriasIndicadores, onCategoriaChange]);

  const getIconComponent = (iconName: string): React.ComponentType<{ size?: number; style?: React.CSSProperties }> => {
    const Icon = LucideIcons[iconName as keyof typeof LucideIcons];
    if (Icon && typeof Icon === 'function') {
      return Icon as React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
    }
    return LucideIcons.Circle;
  };

  return (
    <div className="flex flex-wrap gap-3">
      {eixos.map((eixo) => {
        const IconComponent = getIconComponent(eixo.icone);
        const isActive = eixo.id === categoriaSelecionadaId;
        const nomeEixo = formatarNomeCategoria(eixo);

        return (
          <button
            key={eixo.id}
            onClick={() => setCategoriaSelecionadaId(isActive ? undefined : eixo.id)}
            aria-pressed={isActive}
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
            <IconComponent size={16} style={{ color: isActive ? "white" : eixo.cor }} />
            {nomeEixo}
          </button>
        );
      })}
    </div>
  );
}