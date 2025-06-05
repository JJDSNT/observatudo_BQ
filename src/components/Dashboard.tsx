import React from "react";
import {
  SubeixoResultado,
  Indicador,
  LocalidadePayload,
} from "@/types/oldindicadores";
import { MetricCard } from "./MetricCard/MetricCard";

type DashboardPayload = {
  pais: LocalidadePayload;
  municipio: LocalidadePayload;
  estado: LocalidadePayload;
};

type DashboardProps = {
  payload: DashboardPayload;
};

export const Dashboard: React.FC<DashboardProps> = ({ payload }) => {
  const renderCards = (label: string, localidade: LocalidadePayload) => (
    <>
      <h2 className="text-lg font-semibold mb-4">
        {label}: {localidade.nome}
      </h2>

      {localidade.subeixos.map((subeixo: SubeixoResultado) => (
        <div key={`${localidade.id}-${subeixo.id}`} className="mb-6">
          <h3 className="text-md font-medium mb-2">{subeixo.nome}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subeixo.indicadores.length > 0 ? (
              subeixo.indicadores.map((indicador: Indicador) => (
                <MetricCard
                  key={`${indicador.id}-${localidade.id}`}
                  indicador={indicador}
                  localidadeNome={localidade.nome}
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
    </>
  );

  return (
    <div className="max-w-5xl mx-auto px-2 py-6 space-y-8">
      {renderCards("País", payload.pais)}
      {renderCards("Estado", payload.estado)}
      {renderCards("Município", payload.municipio)}
    </div>
  );
};

export default Dashboard;
