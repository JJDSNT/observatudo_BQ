// src/components/Dashboard.tsx
"use client";

import React from "react";
import {
  Indicador,
  SubeixoResultado,
  CategoriaResultado,
  IndicadoresPayload,
} from "@/types";
import { MetricCard } from "./MetricCard/MetricCard";
import { usePreferencesStore } from "@/store/preferencesStore";

type DashboardProps = {
  payload: IndicadoresPayload;
};

export const Dashboard: React.FC<DashboardProps> = ({ payload }) => {
  const categoriaId = usePreferencesStore((s) => s.selecionado.categoriaId);

  const renderCategoriaNivel = (
    label: string,
    categorias: CategoriaResultado[]
  ) => {
    const categoria = categorias.find((c) => c.id === categoriaId);
    if (!categoria) return null;

    return (
      <div>
        <h2 className="text-lg font-semibold mb-4">{label}</h2>

        {categoria.subeixos.map((subeixo: SubeixoResultado) => (
          <div key={`${label}-${subeixo.id}`} className="mb-6">
            <h3 className="text-md font-medium mb-2">{subeixo.nome}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subeixo.indicadores.length > 0 ? (
                subeixo.indicadores.map((indicador: Indicador) => (
                  <MetricCard
                    key={`${indicador.id}-${label}`}
                    indicador={indicador}
                    localidadeNome={label}
                  />
                ))
              ) : (
                <div className="text-sm text-gray-400 col-span-full">
                  Nenhum indicador neste subeixo.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-2 py-6 space-y-8">
      {renderCategoriaNivel("País", payload.niveis.pais)}
      {renderCategoriaNivel("Estado", payload.niveis.estado)}
      {renderCategoriaNivel("Município", payload.niveis.municipio)}
    </div>
  );
};

export default Dashboard;
