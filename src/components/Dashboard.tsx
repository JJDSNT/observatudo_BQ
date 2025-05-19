import React from "react";
import { LocalidadeFullResponse, CategoriaComIndicadores } from "@/types/indicadores";
import { MetricCard } from "./MetricCard/MetricCard";

type DashboardProps = {
  payload: LocalidadeFullResponse;
};

export const Dashboard: React.FC<DashboardProps> = ({ payload }) => {
  const renderCards = (label: string, localidade: typeof payload.municipio) => (
    <>
      <h2 className="text-lg font-semibold mb-4">
        {label}: {localidade.nome}
      </h2>

      {localidade.categorias.map((categoria: CategoriaComIndicadores) => (
        <div key={`${localidade.id}-${categoria.id}`} className="mb-6">
          <h3 className="text-md font-medium mb-2">{categoria.nome}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoria.indicadores.length > 0 ? (
              categoria.indicadores.map((indicador) => (
                <MetricCard
                  key={`${indicador.id}-${localidade.id}`}
                  indicador={indicador}
                  localidadeNome={localidade.nome}
                />
              ))
            ) : (
              <div className="text-sm text-gray-400 col-span-full">
                Nenhum indicador nesta categoria.
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
