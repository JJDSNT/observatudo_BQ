'use client';

import React, { useState, useEffect } from 'react';

type Indicador = {
  id: string;
  nome: string;
  descricao?: string;
};

type IndicadorSearchProps = {
  onSelect: (indicador: Indicador) => void;
};

export const IndicadorSearch: React.FC<IndicadorSearchProps> = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<Indicador[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!query || query.length < 2) {
        setResultados([]);
        return;
      }

      const buscarIndicadores = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/indicadores/search?query=${encodeURIComponent(query)}`);
          const data = await res.json();
          setResultados(data);
        } catch (e) {
          console.error('Erro na busca de indicadores:', e);
        }
        setLoading(false);
      };

      buscarIndicadores();
    }, 300); // debounce de 300ms

    return () => clearTimeout(handler); // limpa timeout anterior ao digitar novamente
  }, [query]);

  return (
    <div className="w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Buscar indicador..."
        className="w-full p-2 border rounded"
      />
      {loading && <p className="text-sm text-gray-500 mt-1">Buscando...</p>}
      {resultados.length > 0 && (
        <ul className="mt-2 border rounded shadow bg-white max-h-60 overflow-y-auto">
          {resultados.map(indicador => (
            <li
              key={indicador.id}
              onClick={() => {
                onSelect(indicador);
                setQuery(indicador.nome);
                setResultados([]);
              }}
              className="p-2 hover:bg-blue-100 cursor-pointer"
            >
              <div className="font-medium">{indicador.nome}</div>
              {indicador.descricao && (
                <div className="text-xs text-gray-500">{indicador.descricao}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
