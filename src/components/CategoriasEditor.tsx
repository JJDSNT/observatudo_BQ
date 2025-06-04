// src/components/CategoriasEditor.tsx
"use client";

import { useCategoriasIndicadores } from "@/hooks/useCategoriasIndicadores";
import { CategoriaIndicador } from "@/types/categorias-indicadores";
import { useEffect, useMemo, useState } from "react";
import { Pencil } from "lucide-react";

export default function CategoriasEditor() {
  const { categoriasIndicadores, setCategoriasIndicadores, loading, error } =
    useCategoriasIndicadores();

  const [edicaoLocal, setEdicaoLocal] = useState<CategoriaIndicador[]>([]);

  const categoriasMemo = useMemo(() => categoriasIndicadores, [categoriasIndicadores]);

  useEffect(() => {
    if (categoriasMemo.length > 0) {
      setEdicaoLocal(categoriasMemo);
    }
  }, [categoriasMemo]);

  const salvarAlteracoes = () => {
    setCategoriasIndicadores(edicaoLocal);
  };

  const adicionarCategoria = () => {
    const novaCategoria: CategoriaIndicador = {
      id: Date.now(),
      cor: "#000000",
      icone: "Circle",
      subeixos: [],
    };
    setEdicaoLocal([...edicaoLocal, novaCategoria]);
  };

  const atualizarNomeCategoria = (index: number, novoNome: string) => {
    const atualizadas = [...edicaoLocal];
    (atualizadas[index] as any).nome = novoNome;
    setEdicaoLocal(atualizadas);
  };

  if (loading) return <p>Carregando categorias...</p>;
  if (error) return <p>Erro: {error}</p>;

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Editor de Categorias</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {edicaoLocal.map((categoria, index) => (
          <div
            key={categoria.id}
            className="border rounded-xl p-4 shadow space-y-2 bg-white dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={(categoria as any).nome || `Categoria ${categoria.id}`}
                onChange={(e) => atualizarNomeCategoria(index, e.target.value)}
                className="font-semibold text-lg bg-transparent border-b border-zinc-300 focus:outline-none focus:border-blue-500 dark:border-zinc-700 dark:text-white"
              />
              <span className="text-sm">Ícone: {categoria.icone}</span>
            </div>
            <div className="text-sm">
              Cor: <span style={{ color: categoria.cor }}>{categoria.cor}</span>
            </div>
            <div className="text-xs text-zinc-500">
              {categoria.subeixos.length} subeixos definidos
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={adicionarCategoria}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Nova Categoria
        </button>

        <button
          onClick={salvarAlteracoes}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Salvar Alterações
        </button>
      </div>
    </section>
  );
}
