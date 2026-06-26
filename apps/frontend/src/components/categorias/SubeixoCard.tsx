// src/components/categorias/SubeixoCard.tsx
'use client';

import { X, Loader2, Pencil, Plus, Search } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

interface ResultadoBusca {
  id: string;
  nome: string;
  descricao?: string;
}

interface SubeixoCardProps {
  readonly id?: string;
  readonly nome: string;
  readonly indicadores: string[];
  readonly getNome: (id: string) => string;
  readonly loading?: boolean;
  readonly onRemoveIndicador?: (indicadorId: string) => void;
  readonly onAddIndicador?: (indicadorId: string) => void;
  readonly onUpdateNome?: (novoNome: string) => void;
  readonly className?: string;
}

function BuscaIndicador({ onAdd, indicadoresExistentes }: {
  onAdd: (id: string) => void;
  indicadoresExistentes: string[];
}) {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<ResultadoBusca[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [aberto, setAberto] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (aberto) inputRef.current?.focus();
  }, [aberto]);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        fechar();
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  function fechar() {
    setAberto(false);
    setQuery('');
    setResultados([]);
  }

  const buscar = useCallback(async (texto: string) => {
    if (texto.length < 2) { setResultados([]); return; }
    setBuscando(true);
    try {
      const res = await fetch(`/api/indicadores/search?query=${encodeURIComponent(texto)}`);
      const dados: ResultadoBusca[] = await res.json();
      setResultados(dados);
    } catch {
      setResultados([]);
    } finally {
      setBuscando(false);
    }
  }, []);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const texto = e.target.value;
    setQuery(texto);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => buscar(texto), 300);
  }

  function selecionar(id: string) {
    onAdd(id);
    fechar();
  }

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
      >
        <Plus size={13} />
        Adicionar indicador
      </button>
    );
  }

  const disponiveis = resultados.filter((r) => !indicadoresExistentes.includes(r.id));

  return (
    <div ref={containerRef} className="mt-2 relative">
      <div className="flex items-center gap-1 rounded border border-blue-300 dark:border-blue-600 bg-white dark:bg-zinc-800 px-2 py-1 text-sm">
        <Search size={13} className="text-gray-400 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={onChange}
          placeholder="Buscar indicador..."
          className="flex-1 bg-transparent outline-none min-w-0 text-xs"
          onKeyDown={(e) => e.key === 'Escape' && fechar()}
        />
        {buscando && <Loader2 size={13} className="animate-spin text-gray-400 flex-shrink-0" />}
        <button onClick={fechar} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
          <X size={13} />
        </button>
      </div>

      {query.length >= 2 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {disponiveis.length === 0 && !buscando && (
            <p className="text-xs text-gray-500 px-3 py-2">
              {resultados.length === 0 ? 'Nenhum resultado' : 'Todos já estão neste subeixo'}
            </p>
          )}
          {disponiveis.map((r) => (
            <button
              key={r.id}
              onClick={() => selecionar(r.id)}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors border-b border-gray-100 dark:border-zinc-700 last:border-0"
            >
              <p className="text-xs font-medium text-gray-800 dark:text-gray-100 truncate">{r.nome}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{r.id}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function SubeixoCard({
  id: _id,
  nome,
  indicadores,
  getNome,
  loading = false,
  onRemoveIndicador,
  onAddIndicador,
  onUpdateNome,
  className,
}: SubeixoCardProps) {
  const [editando, setEditando] = useState(false);
  const [nomeTemp, setNomeTemp] = useState(nome);

  const salvarNome = () => {
    setEditando(false);
    if (nomeTemp !== nome && onUpdateNome) {
      onUpdateNome(nomeTemp.trim());
    }
  };

  return (
    <div
      className={`border rounded-lg p-4 space-y-3 bg-white dark:bg-zinc-900 ${className ?? ''}`}
      data-subeixo-id={_id}
    >
      <div className="flex items-center justify-between">
        {editando ? (
          <input
            type="text"
            value={nomeTemp}
            onChange={(e) => setNomeTemp(e.target.value)}
            onBlur={salvarNome}
            onKeyDown={(e) => {
              if (e.key === 'Enter') salvarNome();
              if (e.key === 'Escape') { setNomeTemp(nome); setEditando(false); }
            }}
            autoFocus
            className="text-lg font-semibold bg-transparent border-b border-gray-300 dark:border-zinc-700 focus:outline-none focus:border-blue-500"
          />
        ) : (
          <h3
            className="text-lg font-semibold cursor-pointer"
            onClick={() => setEditando(true)}
            title="Clique para editar"
          >
            {nome}
          </h3>
        )}

        {loading && <Loader2 size={16} className="animate-spin text-zinc-500" />}
        {!loading && !editando && (
          <button
            onClick={() => setEditando(true)}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            title="Editar nome do subeixo"
          >
            <Pencil size={16} />
          </button>
        )}
      </div>

      {indicadores.length === 0 ? (
        <p className="text-sm text-zinc-500 italic">Nenhum indicador associado</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {indicadores.map((indicador) => (
            <li key={indicador} className="flex items-center justify-between group">
              <span className="truncate flex-1 mr-2" title={getNome(indicador)}>
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

      {onAddIndicador && (
        <BuscaIndicador
          onAdd={onAddIndicador}
          indicadoresExistentes={indicadores}
        />
      )}
    </div>
  );
}
