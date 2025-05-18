// src/components/MetricCard/MetricCard.tsx

import React from 'react';
import { Indicador } from '../../types/indicadores';

type MetricCardProps = {
  indicador: Indicador;
  localidadeNome?: string;
};

export const MetricCard: React.FC<MetricCardProps> = ({ indicador, localidadeNome }) => {
  const ultimaMedida = indicador.serie.length > 0
    ? indicador.serie[indicador.serie.length - 1]
    : undefined;

  return (
    <div className="rounded-lg shadow p-4 bg-white flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-sm text-gray-500">{localidadeNome}</div>
          <div className="text-lg font-semibold">{indicador.nome}</div>
        </div>
        <div className="text-2xl font-bold text-blue-600">
          {ultimaMedida ? ultimaMedida.valor.toLocaleString('pt-BR') : '--'}
          {indicador.unidade ? <span className="text-base ml-1">{indicador.unidade}</span> : null}
        </div>
      </div>
      {ultimaMedida?.data && (
        <div className="text-xs text-gray-500">
          Última atualização: {new Date(ultimaMedida.data).toLocaleDateString('pt-BR')}
        </div>
      )}
      <div className="text-xs text-gray-400">
        {indicador.fonte ? <>Fonte: {indicador.fonte}</> : null}
      </div>
    </div>
  );
};