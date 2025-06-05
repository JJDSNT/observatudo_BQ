// src/components/categorias/SubeixoCard.tsx
'use client';

import { X, Loader2 } from 'lucide-react';

interface SubeixoCardProps {
  readonly nome: string;
  readonly indicadores: string[];
  readonly getNome: (id: string) => string;
  readonly loading?: boolean;
  readonly onRemoveIndicador?: (indicadorId: string) => void;
  readonly className?: string;
}

export function SubeixoCard({
  nome,
  indicadores,
  getNome,
  loading = false,
  onRemoveIndicador,
  className,
}: SubeixoCardProps) {
  return (
    <div
      className={`border rounded-lg p-4 space-y-3 bg-white dark:bg-zinc-900 ${className ?? ''}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{nome}</h3>
        {loading && (
          <Loader2 size={16} className="animate-spin text-zinc-500" />
        )}
      </div>

      {indicadores.length === 0 ? (
        <p className="text-sm text-zinc-500 italic">Nenhum indicador associado</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {indicadores.map((indicador) => (
            <li key={indicador} className="flex items-center justify-between group">
              <span 
                className="truncate flex-1 mr-2"
                title={getNome(indicador)}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={12} className="animate-spin" />
                    Carregando...
                  </span>
                ) : (
                  getNome(indicador)
                )}
              </span>
              {onRemoveIndicador && (
                <button
                  onClick={() => onRemoveIndicador(indicador)}
                  className="text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Remover indicador"
                  aria-label={`Remover indicador ${getNome(indicador)}`}
                >
                  <X size={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      
      {indicadores.length > 0 && (
        <div className="text-xs text-zinc-400 pt-2 border-t">
          {indicadores.length} indicador{indicadores.length !== 1 ? 'es' : ''}
        </div>
      )}
    </div>
  );
}
