// src/components/CategoriaSelector.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import * as LucideIcons from "lucide-react";
import { useSelecionado } from "@/store/hooks/useSelecionado";
import { formatarNomeCategoria } from "@/utils/categoriaUtils";
import type { Categoria, Subeixo } from "@/types";

type CategoriaSelectorProps = {
  eixos: Categoria[] | undefined;
  onCategoriaChange: (subeixos: Subeixo[]) => void;
};

export default function CategoriaSelector({
  eixos,
  onCategoriaChange,
}: Readonly<CategoriaSelectorProps>) {
  const safeEixos = useMemo(() => {
    if (!Array.isArray(eixos)) {
      console.warn("⚠️ CategoriaSelector: 'eixos' não é um array:", eixos);
      return [];
    }
    return eixos;
  }, [eixos]);

  const [selecionado, setSelecionado] = useSelecionado();

  // Inicializa com a categoria salva ou a primeira disponível
  const [categoriaSelecionadaId, setCategoriaSelecionadaId] = useState<number | null>(
    safeEixos.find((e) => e.id === selecionado.categoriaId)?.id ?? safeEixos[0]?.id ?? null
  );

  // Garante que sempre exista uma seleção válida quando os eixos mudam
  useEffect(() => {
    if (!categoriaSelecionadaId && safeEixos.length > 0) {
      setCategoriaSelecionadaId(safeEixos[0].id);
    }
  }, [safeEixos, categoriaSelecionadaId]);

  const memoizedOnCategoriaChange = useCallback(onCategoriaChange, [onCategoriaChange]);

  useEffect(() => {
    const eixo = safeEixos.find((e) => e.id === categoriaSelecionadaId);
    const subeixosSelecionados = eixo?.subeixos ?? [];

    // Atualiza store Zustand apenas se necessário
    if (categoriaSelecionadaId && selecionado.categoriaId !== categoriaSelecionadaId) {
      setSelecionado({ categoriaId: categoriaSelecionadaId });
    }

    memoizedOnCategoriaChange(subeixosSelecionados);
  }, [
    categoriaSelecionadaId,
    safeEixos,
    selecionado.categoriaId,
    setSelecionado,
    memoizedOnCategoriaChange,
  ]);

  const getIconComponent = (
    iconName: string
  ): React.FC<{ size?: number; style?: React.CSSProperties }> => {
    return LucideIcons[iconName as keyof typeof LucideIcons] as React.FC<{
      size?: number;
      style?: React.CSSProperties;
    }>;
  };

  return (
    <div className="flex flex-wrap gap-3">
      {safeEixos.map((eixo) => {
        const IconComponent = getIconComponent(eixo.icone);
        const isActive = eixo.id === categoriaSelecionadaId;
        const nomeEixo = formatarNomeCategoria(eixo);

        return (
          <button
            key={eixo.id}
            onClick={() => {
              if (!isActive) {
                setCategoriaSelecionadaId(eixo.id);
              }
            }}
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
            <IconComponent
              size={16}
              style={{ color: isActive ? "white" : eixo.cor }}
            />
            {nomeEixo}
          </button>
        );
      })}
    </div>
  );
}
