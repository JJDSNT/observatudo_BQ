// src/components/CategoriasEditor.tsx
"use client";

import { useCategoriasIndicadores } from "@/hooks/useCategoriasIndicadores";
import { CategoriaIndicador, Subeixo } from "@/types/categorias-indicadores";
import { useEffect, useMemo, useState } from "react";
import { LucideIconName } from "@/components/IconSelector";
import { CategoriaCard } from "./CategoriaCard";

const iconesDisponiveis: LucideIconName[] = [
  "Circle",
  "GraduationCap",
  "HeartPulse",
  "HandHeart",
  "ShieldCheck",
  "Globe",
  "BarChart2",
];

// 🔧 Função utilitária para criar subeixos
function criarSubeixoPadrao(categoriaId: number): Subeixo {
  return {
    id: `sub-${categoriaId}-${Date.now()}`,
    nome: "Novo subeixo",
    indicadores: [],
  };
}

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

  const salvarAlteracoes = () => setCategoriasIndicadores(edicaoLocal);

  const deletarCategoria = (id: number) => {
    setEdicaoLocal((prev) => prev.filter((cat) => cat.id !== id));
  };

  const adicionarCategoria = () => {
    const timestamp = Date.now();
    const novaCategoria: CategoriaIndicador = {
      id: timestamp,
      cor: "#000000",
      icone: "Circle",
      subeixos: [criarSubeixoPadrao(timestamp)],
    };
    setEdicaoLocal((prev) => [...prev, novaCategoria]);
  };

  const atualizarCategoria = (
    id: number,
    atualizacao: Partial<CategoriaIndicador>
  ) => {
    setEdicaoLocal((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...atualizacao } : cat))
    );
  };

  const atualizarNomeSubeixo = (
    categoriaId: number,
    subeixoId: string,
    novoNome: string
  ) => {
    setEdicaoLocal((prev) =>
      prev.map((cat) =>
        cat.id === categoriaId
          ? {
              ...cat,
              subeixos: cat.subeixos.map((s) =>
                s.id === subeixoId ? { ...s, nome: novoNome } : s
              ),
            }
          : cat
      )
    );
  };

  const adicionarSubeixo = (categoriaId: number) => {
    setEdicaoLocal((prev) =>
      prev.map((cat) =>
        cat.id === categoriaId
          ? {
              ...cat,
              subeixos: [...cat.subeixos, criarSubeixoPadrao(categoriaId)],
            }
          : cat
      )
    );
  };

  const removerSubeixo = (categoriaId: number, subeixoId: string) => {
    setEdicaoLocal((prev) =>
      prev.map((cat) =>
        cat.id === categoriaId
          ? {
              ...cat,
              subeixos: cat.subeixos.filter((s) => s.id !== subeixoId),
            }
          : cat
      )
    );
  };

  const removerIndicadorSubeixo = (
    categoriaId: number,
    subeixoId: string,
    indicadorId: string
  ) => {
    setEdicaoLocal((prev) =>
      prev.map((cat) =>
        cat.id === categoriaId
          ? {
              ...cat,
              subeixos: cat.subeixos.map((s) =>
                s.id === subeixoId
                  ? {
                      ...s,
                      indicadores: s.indicadores.filter((id) => id !== indicadorId),
                    }
                  : s
              ),
            }
          : cat
      )
    );
  };

  if (loading) return <p>Carregando categorias...</p>;
  if (error) return <p>Erro: {error}</p>;

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Editor de Categorias</h2>

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
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
        >
          Salvar Alterações
        </button>
      </div>
    </section>
  );
}
