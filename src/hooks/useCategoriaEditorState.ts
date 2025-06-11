// src/hooks/useCategoriaEditorState.ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useCategorias } from '@/store/hooks/useCategorias';
import { Categoria } from '@/types';
import {
  criarCategoriaPadrao,
  adicionarSubeixo,
  removerSubeixo,
  removerIndicador,
} from '@/utils/categoriaUtils';

export function useCategoriaEditorState() {
  const [categoriasIndicadores, setCategoriasIndicadores] = useCategorias();

  const [edicaoLocal, setEdicaoLocal] = useState<Categoria[]>([]);

  useEffect(() => {
    setEdicaoLocal(categoriasIndicadores);
  }, [categoriasIndicadores]);

  const salvarAlteracoes = useCallback(() => {
    setCategoriasIndicadores(edicaoLocal);
  }, [edicaoLocal, setCategoriasIndicadores]);

  const deletarCategoria = useCallback((id: number) => {
    setEdicaoLocal((prev) => prev.filter((cat) => cat.id !== id));
  }, []);

  const adicionarCategoria = useCallback(() => {
    setEdicaoLocal((prev) => [...prev, criarCategoriaPadrao()]);
  }, []);

  const atualizarCategoria = useCallback(
    (id: number, atualizacao: Partial<Categoria>) => {
      setEdicaoLocal((prev) =>
        prev.map((cat) => (cat.id === id ? { ...cat, ...atualizacao } : cat))
      );
    },
    []
  );

  const adicionarSubeixoLocal = useCallback((categoriaId: number) => {
    setEdicaoLocal((prev) =>
      prev.map((cat) =>
        cat.id === categoriaId ? adicionarSubeixo(cat) : cat
      )
    );
  }, []);

  const removerSubeixoLocal = useCallback((categoriaId: number, subeixoId: string) => {
    setEdicaoLocal((prev) =>
      prev.map((cat) =>
        cat.id === categoriaId ? removerSubeixo(cat, subeixoId) : cat
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

  const reordenarCategorias = useCallback((novaOrdem: number[]) => {
    setEdicaoLocal((prev) => {
      const novaLista: Categoria[] = novaOrdem
        .map((id) => prev.find((cat) => cat?.id === id))
        .filter((cat): cat is Categoria => !!cat);
      return novaLista;
    });
  }, []);

  return {
    edicaoLocal,
    adicionarCategoria,
    atualizarCategoria,
    deletarCategoria,
    adicionarSubeixo: adicionarSubeixoLocal,
    removerSubeixo: removerSubeixoLocal,
    removerIndicadorSubeixo,
    salvarAlteracoes,
    reordenarCategorias,
    temAlteracoes: JSON.stringify(edicaoLocal) !== JSON.stringify(categoriasIndicadores),
  };
}
