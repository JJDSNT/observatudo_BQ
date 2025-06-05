// src/components/CategoriaSelector.tsx
"use client";

import React, { useState, useEffect } from "react";
import * as LucideIcons from "lucide-react";
import { useUserPreferences } from "@/store/useUserPreferences";
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
    preferences.eixoSelecionado ?? undefined
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
      preferences.eixoSelecionado !== eixoSelecionado ||
      JSON.stringify(preferences.categoriasIndicadores) !==
        JSON.stringify(categoriasIndicadores);

    if (precisaAtualizar) {
      setPreferences({
        eixoSelecionado,
        categoriasIndicadores,
      });
    }

    onCategoriaChange(subeixosSelecionados);
  }, [eixoSelecionado, eixos, preferences, onCategoriaChange, setPreferences]);

  const formatarNome = (subeixos: Subeixo[]) => {
    const nomes = subeixos.map((s) => s.nome);
    return nomes.length <= 1
      ? nomes[0] ?? ""
      : nomes.slice(0, -1).join(", ") + " & " + nomes[nomes.length - 1];
  };

  return (
    <div className="flex flex-wrap gap-3">
      {eixos.map((eixo) => {
        const Icon = LucideIcons[eixo.icone as keyof typeof LucideIcons] as React.ElementType;
        const isActive = eixo.id === eixoSelecionado;
        const nomeEixo = formatarNome(eixo.subeixos);

        return (
          <button
            key={eixo.id}
            onClick={() =>
              setEixoSelecionado(isActive ? undefined : eixo.id)
            }
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
