// src/components/SubeixoCard.tsx
'use client';

import { X } from 'lucide-react';

interface SubeixoCardProps {
  readonly nome: string;
  readonly indicadores: string[];
  readonly onRemoveIndicador?: (indicadorId: string) => void;
  readonly className?: string;
}

export function SubeixoCard({
  nome,
  indicadores,
  onRemoveIndicador,
  className,
}: SubeixoCardProps) {
  return (
    <div
      className={`border rounded-lg p-4 space-y-3 bg-white dark:bg-zinc-900 ${className ?? ''}`}
    >
      <h3 className="text-lg font-semibold">{nome}</h3>

      {indicadores.length === 0 ? (
        <p className="text-sm text-zinc-500 italic">Nenhum indicador associado</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {indicadores.map((indicador) => (
            <li key={indicador} className="flex items-center justify-between">
              <span className="truncate">{indicador}</span>
              {onRemoveIndicador && (
                <button
                  onClick={() => onRemoveIndicador(indicador)}
                  className="text-red-600 hover:text-red-800"
                  title="Remover"
                >
                  <X size={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
