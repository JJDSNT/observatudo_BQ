// src/components/CategoriasEditor.tsx

/**
 * 📘 CATEGORIAS EDITOR
 *
 * Esta página permite editar as categorias e seus respectivos subeixos e indicadores.
 *
 * ✅ FUNCIONALIDADES IMPLEMENTADAS:
 * - Carregamento dos dados salvos no banco (hook `useCategoriasIndicadores`)
 * - Fallback automático para `categoriasIndicadores.json` caso o banco esteja vazio
 * - Edição de cor e ícone da categoria
 * - Adição e remoção de categorias
 * - Adição e remoção de subeixos
 * - Edição de nome do subeixo
 * - Remoção de indicadores de um subeixo
 *
 * 💡 SUGESTÕES FUTURAS:
 * - Adicionar botão de reset para restaurar categorias padrão do JSON manualmente
 * - Implementar "drag and drop" para reordenar categorias e subeixos
 * - Adicionar indicadores a subeixos usando um seletor baseado em busca
 * - Implementar validações (ex: evitar nomes em branco ou duplicados)
 * - Mostrar um toast de confirmação ao salvar ou resetar
 * - Refatorar os subcomponentes em arquivos separados para melhor organização
 */

"use client";

import { useCategoriasIndicadores } from "@/hooks/useCategoriasIndicadores";
import { CategoriaIndicador, Subeixo } from "@/types/categorias";
import { useEffect, useMemo, useState } from "react";
import { LucideIconName } from "@/components/IconSelector";
import { CategoriaCard } from "./CategoriaCard";
import categoriasPadrao from "@/data/categoriasIndicadores.json" assert { type: "json" };

const iconesDisponiveis: LucideIconName[] = [
  "Circle",
  "GraduationCap",
  "HeartPulse",
  "HandHeart",
  "ShieldCheck",
  "Globe",
  "BarChart2",
];

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

  const categoriasMemo = useMemo(
    () => categoriasIndicadores,
    [categoriasIndicadores]
  );

  useEffect(() => {
    const categoriasValidas =
      Array.isArray(categoriasMemo) && categoriasMemo.length > 0;

    if (categoriasValidas) {
      console.log("✅ Carregando categorias do banco de dados");
      setEdicaoLocal(categoriasMemo);
    } else {
      console.warn(
        "⚠️ Nenhuma categoria encontrada no banco. Usando padrão do JSON..."
      );
      const padraoConvertido: CategoriaIndicador[] = categoriasPadrao.map(
        (cat) => ({
          ...cat,
          icone: cat.icone as LucideIconName,
        })
      );
      console.log("📦 Categorias padrão carregadas:", padraoConvertido);
      setEdicaoLocal(padraoConvertido);
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
                      indicadores: s.indicadores.filter(
                        (id) => id !== indicadorId
                      ),
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
