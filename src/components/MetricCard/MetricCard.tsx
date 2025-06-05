// src/components/MetricCard/MetricCard.tsx
import React from "react";
import { Indicador } from "../../types/oldindicadores";

type MetricCardProps = {
  indicador: Indicador;
  localidadeNome?: string;
};

export const MetricCard: React.FC<MetricCardProps> = ({
  indicador,
  localidadeNome,
}) => {
  const ultimaMedida = indicador.serie.at(-1);
  const serieRecentes = indicador.serie.slice(-5);

  const formatarData = (data: unknown): string => {
    if (!data) return "--";

    if (typeof data === "object" && data !== null && "value" in data) {
      const value = (data as { value?: string }).value;
      return typeof value === "string" ? value : "--";
    }

    if (typeof data === "string") return data;

    return "--";
  };

  return (
    <div className="rounded-lg shadow p-4 bg-white flex flex-col gap-2 text-sm">
      {/* Cabeçalho */}
      <div className="flex justify-between items-start">
        <div>
          {localidadeNome && (
            <div className="text-xs text-gray-500 mb-0.5">{localidadeNome}</div>
          )}
          <div className="text-base font-semibold leading-tight">
            {indicador.nome || `Indicador ${indicador.id}`}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-blue-600">
            {ultimaMedida?.valor !== null && ultimaMedida?.valor !== undefined
              ? ultimaMedida.valor.toLocaleString("pt-BR")
              : "--"}
            {indicador.unidade && (
              <span className="text-sm ml-1 text-gray-700">
                {indicador.unidade}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Última atualização */}
      <div className="text-xs text-gray-500">
        Última atualização: {formatarData(ultimaMedida?.data)}
      </div>

      {/* Últimos 5 valores */}
      <div className="mt-1 text-xs text-gray-600 space-y-0.5">
        {serieRecentes.map((ponto) => (
          <div key={formatarData(ponto.data)} className="flex justify-between">
            <span>{formatarData(ponto.data)}</span>
            <span>
              {ponto.valor !== null
                ? ponto.valor.toLocaleString("pt-BR")
                : "--"}
            </span>
          </div>
        ))}
      </div>

      {/* Fonte */}
      {indicador.fonte && (
        <div className="text-xs text-gray-400 mt-1 italic">
          Fonte: {indicador.fonte}
        </div>
      )}

      {/* 🔜 Gráfico futuro */}
      {/* <LineChart data={serieRecentes} /> */}
    </div>
  );
};
