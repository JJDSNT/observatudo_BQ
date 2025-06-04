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
 * - Exibição dos nomes dos indicadores (hook `useIndicadorNomes`)
 * - Organização dos componentes em arquivos separados (`CategoriaCard`, `SubeixoCard`)
 *
 * 💡 SUGESTÕES FUTURAS:
 * - Adicionar botão de reset para restaurar categorias padrão do JSON manualmente
 * - Implementar "drag and drop" para reordenar categorias e subeixos (dnd-kit)
 * - Adicionar indicadores a subeixos usando um seletor baseado em busca (`buscarIndicadores`)
 * - Implementar validações (ex: evitar nomes em branco ou duplicados)
 * - Mostrar um toast de confirmação ao salvar ou resetar
 * - Adicionar suporte a persistência otimista ou undo/redo
 */


'use client';

import { CategoriaCard } from '@/components/categorias/CategoriaCard';
import { LucideIconName } from '@/components/IconSelector';
import { useCategoriaEditorState } from '@/hooks/useCategoriaEditorState';
import { useIndicadorNomes } from '@/hooks/useIndicadorNomes';

const iconesDisponiveis: LucideIconName[] = [
  'Circle',
  'GraduationCap',
  'HeartPulse',
  'HandHeart',
  'ShieldCheck',
  'Globe',
  'BarChart2',
];

export default function CategoriasEditor() {
  const {
    edicaoLocal,
    loading,
    error,
    adicionarCategoria,
    atualizarCategoria,
    deletarCategoria,
    adicionarSubeixo,
    removerSubeixo,
    atualizarNomeSubeixo,
    removerIndicadorSubeixo,
    salvarAlteracoes,
  } = useCategoriaEditorState();

  // 🔍 Reúne todos os IDs de indicadores usados
  const todosIndicadores = edicaoLocal.flatMap((categoria) =>
    categoria.subeixos.flatMap((s) => s.indicadores)
  );

  const nomesMap = useIndicadorNomes(todosIndicadores);

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
            mapaNomes={nomesMap}
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
