"use client";

import React, { useState, useEffect } from "react";
import * as LucideIcons from "lucide-react";
import { useUserPreferences } from "@/store/useUserPreferences";
import { formatarNomeCategoria } from "@/utils/categoriaUtils";
import type { CategoriaIndicador, Subeixo } from "@/types";

type CategoriaSelectorProps = {
  eixos: CategoriaIndicador[];
  onCategoriaChange: (subeixos: Subeixo[]) => void;
};

export default function CategoriaSelector({
  eixos,
  onCategoriaChange,
}: Readonly<CategoriaSelectorProps>) {
  const { preferences, setPreferences } = useUserPreferences();
  const [eixoSelecionado, setEixoSelecionado] = useState<number | undefined>(
    preferences.selecionado?.eixo ?? undefined
  );

  useEffect(() => {
    const eixo = eixos.find((e) => e.id === eixoSelecionado);
    const subeixosSelecionados = eixo?.subeixos ?? [];

    const categoriasIndicadores =
      eixoSelecionado !== undefined && eixo
        ? [
            {
              id: eixoSelecionado,
              cor: eixo.cor,
              icone: eixo.icone,
              subeixos: subeixosSelecionados,
            },
          ]
        : [];

    const precisaAtualizar =
      preferences.selecionado?.eixo !== eixoSelecionado ||
      JSON.stringify(preferences.categoriasIndicadores) !==
        JSON.stringify(categoriasIndicadores);

    if (precisaAtualizar) {
      setPreferences({
        selecionado: {
          ...preferences.selecionado,
          eixo: eixoSelecionado,
        },
        categoriasIndicadores,
      });
    }

    onCategoriaChange(subeixosSelecionados);
  }, [eixoSelecionado, eixos, preferences, onCategoriaChange, setPreferences]);

  return (
    <div className="flex flex-wrap gap-3">
      {eixos.map((eixo) => {
        const Icon = LucideIcons[eixo.icone as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
        const isActive = eixo.id === eixoSelecionado;
        const nomeEixo = formatarNomeCategoria(eixo);

        return (
          <button
            key={eixo.id}
            onClick={() => setEixoSelecionado(isActive ? undefined : eixo.id)}
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
            <Icon size={16} style={{ color: isActive ? "white" : eixo.cor }} />
            {nomeEixo}
          </button>
        );
      })}
    </div>
  );
}
