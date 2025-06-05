// src/hooks/useCategoriaEditorState.ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useCategoriasIndicadores } from './useCategoriasIndicadores';
import { CATEGORIAS_DEFAULT } from '@/data/categoriasIndicadores';
import { CategoriaIndicador } from '@/types';
import {
  criarCategoriaPadrao,
  criarSubeixoPadrao,
} from '@/utils/categoriaUtils';

export function useCategoriaEditorState() {
  const {
    categoriasIndicadores,
    setCategoriasIndicadores,
    loading,
    error,
  } = useCategoriasIndicadores();

  const [edicaoLocal, setEdicaoLocal] = useState<CategoriaIndicador[]>([]);

  useEffect(() => {
    const categoriasValidas =
      Array.isArray(categoriasIndicadores) && categoriasIndicadores.length > 0;

    if (categoriasValidas) {
      console.log('✅ Carregando categorias do banco de dados');
      setEdicaoLocal(categoriasIndicadores);
    } else if (!loading) {
      console.warn('⚠️ Nenhuma categoria encontrada. Usando padrão do arquivo TS...');
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
    const novaCategoria = criarCategoriaPadrao();
    setEdicaoLocal((prev) => [...prev, novaCategoria]);
  }, []);

  const atualizarCategoria = useCallback((
    id: number,
    atualizacao: Partial<CategoriaIndicador>
  ) => {
    setEdicaoLocal((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...atualizacao } : cat))
    );
  }, []);

  const atualizarNomeSubeixo = useCallback((
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
  }, []);

  const adicionarSubeixo = useCallback((categoriaId: number) => {
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
  }, []);

  const removerSubeixo = useCallback((categoriaId: number, subeixoId: string) => {
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
  }, []);

  const removerIndicadorSubeixo = useCallback((
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
  }, []);

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
