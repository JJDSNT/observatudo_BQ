// src/hooks/useCategoriaEditorState.ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useCategoriasPreferidas } from '@/hooks/useCategoriasPreferidas';

import { CATEGORIAS_DEFAULT } from '@/data/categoriasIndicadores';
import { CategoriaIndicador } from '@/types';
import {
  criarCategoriaPadrao,
  criarSubeixoPadrao,
} from '@/utils/categoriaUtils';

// 🔧 Funções auxiliares para edição
function atualizarNomeSubeixoNaCategoria(
  categoria: CategoriaIndicador,
  subeixoId: string,
  novoNome: string
): CategoriaIndicador {
  return {
    ...categoria,
    subeixos: categoria.subeixos.map((s) =>
      s.id === subeixoId ? { ...s, nome: novoNome } : s
    ),
  };
}

function adicionarSubeixoNaCategoria(categoria: CategoriaIndicador): CategoriaIndicador {
  return {
    ...categoria,
    subeixos: [...categoria.subeixos, criarSubeixoPadrao(categoria.id)],
  };
}

function removerSubeixoNaCategoria(
  categoria: CategoriaIndicador,
  subeixoId: string
): CategoriaIndicador {
  return {
    ...categoria,
    subeixos: categoria.subeixos.filter((s) => s.id !== subeixoId),
  };
}

function removerIndicador(
  categoria: CategoriaIndicador,
  subeixoId: string,
  indicadorId: string
): CategoriaIndicador {
  return {
    ...categoria,
    subeixos: categoria.subeixos.map((s) =>
      s.id === subeixoId
        ? { ...s, indicadores: s.indicadores.filter((id) => id !== indicadorId) }
        : s
    ),
  };
}

export function useCategoriaEditorState() {
  const {
    categoriasIndicadores,
    setCategoriasIndicadores,
    loading,
    error,
  } = useCategoriasPreferidas();

  const [edicaoLocal, setEdicaoLocal] = useState<CategoriaIndicador[]>([]);

  useEffect(() => {
    if (Array.isArray(categoriasIndicadores) && categoriasIndicadores.length > 0) {
      console.log('✅ Carregando categorias preferidas do usuário');
      setEdicaoLocal(categoriasIndicadores);
    } else if (!loading) {
      console.warn('⚠️ Nenhuma preferência encontrada. Carregando categorias padrão do sistema.');
      setEdicaoLocal(CATEGORIAS_DEFAULT);
    }
  }, [categoriasIndicadores, loading]);

  const salvarAlteracoes = useCallback(() => {
    setCategoriasIndicadores(edicaoLocal);
  }, [edicaoLocal, setCategoriasIndicadores]);

  const deletarCategoria = useCallback((id: number) => {
    setEdicaoLocal((prev) => prev.filter((cat) => cat.id !== id));
  }, []);

  const adicionarCategoria = useCallback(() => {
    setEdicaoLocal((prev) => [...prev, criarCategoriaPadrao()]);
  }, []);

  const atualizarCategoria = useCallback((id: number, atualizacao: Partial<CategoriaIndicador>) => {
    setEdicaoLocal((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...atualizacao } : cat))
    );
  }, []);

  const atualizarNomeSubeixo = useCallback(
    (categoriaId: number, subeixoId: string, novoNome: string) => {
      setEdicaoLocal((prev) =>
        prev.map((cat) =>
          cat.id === categoriaId ? atualizarNomeSubeixoNaCategoria(cat, subeixoId, novoNome) : cat
        )
      );
    },
    []
  );

  const adicionarSubeixo = useCallback((categoriaId: number) => {
    setEdicaoLocal((prev) =>
      prev.map((cat) =>
        cat.id === categoriaId ? adicionarSubeixoNaCategoria(cat) : cat
      )
    );
  }, []);

  const removerSubeixo = useCallback((categoriaId: number, subeixoId: string) => {
    setEdicaoLocal((prev) =>
      prev.map((cat) =>
        cat.id === categoriaId ? removerSubeixoNaCategoria(cat, subeixoId) : cat
      )
    );
  }, []);

  const removerIndicadorSubeixo = useCallback(
    (categoriaId: number, subeixoId: string, indicadorId: string) => {
      setEdicaoLocal((prev) =>
        prev.map((cat) =>
          cat.id === categoriaId ? removerIndicador(cat, subeixoId, indicadorId) : cat
        )
      );
    },
    []
  );

  return {
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
  };
}
