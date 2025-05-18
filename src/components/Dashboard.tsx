import React from "react";
import { Indicador } from "@/types/indicadores";
import { MetricCard } from "./MetricCard/MetricCard";

type Localidade = {
  id: string;
  nome: string;
  uf?: string;
  sigla?: string;
  indicadores: Indicador[];
};

type DashboardPayload = {
  municipio: Localidade;
  estado: Localidade;
  pais: Localidade;
};

type DashboardProps = {
  payload: DashboardPayload;
};

export const Dashboard: React.FC<DashboardProps> = ({ payload }) => {
  // Helper para renderizar cards de um nível
  const renderCards = (localidade: Localidade, label: string) => (
    <>
      <h2 className="text-lg font-semibold mb-2">
        {label}: {localidade.nome}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {localidade.indicadores.map((indicador) => (
          <MetricCard
            key={`${indicador.id}-${localidade.id}`}
            indicador={indicador}
            localidadeNome={localidade.nome}
          />
        ))}
        {localidade.indicadores.length === 0 && (
          <div className="text-sm text-gray-400 col-span-full">
            Nenhum indicador disponível para este nível.
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="max-w-5xl mx-auto px-2 py-6">
      {renderCards(payload.pais, "País")}
      {renderCards(payload.estado, "Estado")}
      {renderCards(payload.municipio, "Município")}
    </div>
  );
};

export default Dashboard;
