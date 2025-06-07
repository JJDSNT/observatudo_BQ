'use client';

import { useCallback, useEffect, useState } from 'react';
import { useCategorias } from '@/store/hooks/useCategorias';
import { usePreferencesStore } from '@/store/preferencesStore';

import { CATEGORIAS_DEFAULT } from '@/data/categoriasIndicadores';
import { CategoriaIndicador } from '@/types';
import {
  criarCategoriaPadrao,
  criarSubeixoPadrao,
} from '@/utils/categoriaUtils';

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
  const categoriasIndicadores = useCategorias();
  const setCategoriasIndicadores = usePreferencesStore((s) => s.setCategoriasIndicadores);

  const [edicaoLocal, setEdicaoLocal] = useState<CategoriaIndicador[]>([]);

  useEffect(() => {
    if (Array.isArray(categoriasIndicadores) && categoriasIndicadores.length > 0) {
      console.log('✅ Carregando categorias preferidas do usuário');
      setEdicaoLocal(categoriasIndicadores);
    } else {
      console.warn('⚠️ Nenhuma preferência encontrada. Carregando categorias padrão do sistema.');
      setEdicaoLocal(CATEGORIAS_DEFAULT);
    }
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
    (id: number, atualizacao: Partial<CategoriaIndicador>) => {
      setEdicaoLocal((prev) =>
        prev.map((cat) => (cat.id === id ? { ...cat, ...atualizacao } : cat))
      );
    },
    []
  );

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

  const reordenarCategorias = useCallback((novaOrdem: number[]) => {
    setEdicaoLocal((prev) =>
      novaOrdem
        .map((id) => prev.find((cat) => cat.id === id))
        .filter((cat): cat is CategoriaIndicador => !!cat)
    );
  }, []);

  return {
    edicaoLocal,
    adicionarCategoria,
    atualizarCategoria,
    deletarCategoria,
    adicionarSubeixo,
    removerSubeixo,
    atualizarNomeSubeixo,
    removerIndicadorSubeixo,
    salvarAlteracoes,
    reordenarCategorias,
    temAlteracoes: JSON.stringify(edicaoLocal) !== JSON.stringify(categoriasIndicadores),
  };
}
