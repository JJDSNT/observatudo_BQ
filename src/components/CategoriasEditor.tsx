"use client";

import { CategoriaCard } from "@/components/categorias/CategoriaCard";
import { LucideIconName } from "@/types";
import { useCategoriaEditorState } from "@/hooks/useCategoriaEditorState";
import { useIndicadorNomes } from "@/hooks/useIndicadorNomes";
import { AlertTriangle } from "lucide-react";

const iconesDisponiveis: LucideIconName[] = [
  "Circle",
  "GraduationCap",
  "HeartPulse",
  "HandHeart",
  "ShieldCheck",
  "Globe",
  "BarChart2",
];

export default function CategoriasEditor() {
  const {
    edicaoLocal,
    loading,
    error,
    temAlteracoes,
    adicionarCategoria,
    atualizarCategoria,
    deletarCategoria,
    adicionarSubeixo,
    removerSubeixo,
    atualizarNomeSubeixo,
    removerIndicadorSubeixo,
    salvarAlteracoes,
  } = useCategoriaEditorState();

  const todosIndicadores = edicaoLocal.flatMap((categoria) =>
    categoria.subeixos.flatMap((s) => s.indicadores)
  );

  const { getNome, loading: loadingNomes } =
    useIndicadorNomes(todosIndicadores);

  if (loading) return <p>Carregando categorias...</p>;
  if (error) return <p>Erro: {error}</p>;

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Editor de Categorias</h2>

      {temAlteracoes && (
        <div className="fixed bottom-4 right-4 z-50 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg shadow-md flex items-start gap-3 max-w-sm">
          <AlertTriangle className="w-5 h-5 mt-1 flex-shrink-0" />
          <div className="text-sm">
            <strong>Alterações pendentes</strong>
            <br />
            Clique em{" "}
            <span className="underline font-medium">
              Salvar Alterações
            </span>{" "}
            para persistir suas edições.
          </div>
        </div>
      )}

      {loadingNomes && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-700">
            🔄 Carregando nomes dos indicadores...
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {edicaoLocal.map((categoria) => (
          <CategoriaCard
            key={categoria.id}
            categoria={categoria}
            onUpdate={atualizarCategoria}
            onUpdateSubeixo={atualizarNomeSubeixo}
            onRemoveIndicador={removerIndicadorSubeixo}
            iconesDisponiveis={iconesDisponiveis}
            onDelete={deletarCategoria}
            onAddSubeixo={adicionarSubeixo}
            onRemoveSubeixo={removerSubeixo}
            getNome={getNome}
            loading={loadingNomes}
          />
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={adicionarCategoria}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
        >
          + Nova Categoria
        </button>

        <button
          onClick={salvarAlteracoes}
          disabled={!temAlteracoes}
          className={`px-4 py-2 rounded text-white cursor-pointer transition-colors ${
            temAlteracoes
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Salvar Alterações
        </button>
      </div>
    </section>
  );
}
