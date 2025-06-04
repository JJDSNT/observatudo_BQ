"use client";

import { useCategoriasIndicadores } from "@/hooks/useCategoriasIndicadores";
import { CategoriaIndicador } from "@/types/categorias-indicadores";
import { useEffect, useMemo, useState } from "react";
import { SubeixoCard } from "@/components/SubeixoCard";

const iconesDisponiveis = [
  "Circle",
  "GraduationCap",
  "HeartPulse",
  "HandHeart",
  "ShieldCheck",
  "Globe",
  "BarChart2",
];

export default function CategoriasEditor() {
  const { categoriasIndicadores, setCategoriasIndicadores, loading, error } =
    useCategoriasIndicadores();

  const [edicaoLocal, setEdicaoLocal] = useState<CategoriaIndicador[]>([]);

  const categoriasMemo = useMemo(
    () => categoriasIndicadores,
    [categoriasIndicadores]
  );

  useEffect(() => {
    if (categoriasMemo.length > 0) {
      setEdicaoLocal(categoriasMemo);
    }
  }, [categoriasMemo]);

  const salvarAlteracoes = () => {
    setCategoriasIndicadores(edicaoLocal);
  };

  const adicionarCategoria = () => {
    const timestamp = Date.now();
    const novaCategoria: CategoriaIndicador = {
      id: timestamp,
      cor: "#000000",
      icone: "Circle",
      subeixos: [
        {
          id: `sub-${timestamp}`,
          nome: "Novo Subeixo",
          indicadores: [],
        },
      ],
    };
    setEdicaoLocal([...edicaoLocal, novaCategoria]);
  };

  const atualizarCorCategoria = (id: number, novaCor: string) => {
    setEdicaoLocal((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, cor: novaCor } : cat))
    );
  };

  const atualizarIconeCategoria = (id: number, novoIcone: string) => {
    setEdicaoLocal((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, icone: novoIcone } : cat))
    );
  };

  const atualizarNomeSubeixo = (categoriaId: number, subeixoId: string, novoNome: string) => {
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

  const removerIndicadorSubeixo = (categoriaId: number, subeixoId: string, indicadorId: string) => {
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
          <div
            key={categoria.id}
            className="border rounded-xl p-4 shadow space-y-4 bg-white dark:bg-zinc-900"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg">
                  {categoria.subeixos[0]?.nome ?? `Categoria ${categoria.id}`}
                </span>
                <select
                  value={categoria.icone}
                  onChange={(e) => atualizarIconeCategoria(categoria.id, e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm bg-white dark:bg-zinc-800"
                >
                  {iconesDisponiveis.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-sm flex items-center gap-2">
                Cor:
                <input
                  type="color"
                  value={categoria.cor}
                  onChange={(e) => atualizarCorCategoria(categoria.id, e.target.value)}
                  className="w-8 h-6 border border-gray-300 rounded"
                />
                <span>{categoria.cor}</span>
              </div>

              <div className="space-y-2">
                {categoria.subeixos.map((subeixo) => (
                  <div key={subeixo.id}>
                    <input
                      value={subeixo.nome}
                      onChange={(e) => atualizarNomeSubeixo(categoria.id, subeixo.id, e.target.value)}
                      className="w-full mb-1 px-2 py-1 border rounded text-sm bg-white dark:bg-zinc-800"
                      placeholder="Nome do subeixo"
                    />
                    <SubeixoCard
                      nome={subeixo.nome}
                      indicadores={subeixo.indicadores}
                      onRemoveIndicador={(indicadorId) =>
                        removerIndicadorSubeixo(categoria.id, subeixo.id, indicadorId)
                      }
                    />
                  </div>
                ))}
              </div>
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
