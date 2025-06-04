'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCategoriasIndicadores } from './useCategoriasIndicadores';
import categoriasPadrao from '@/data/categoriasIndicadores.json' assert { type: 'json' };
import { CategoriaIndicador } from '@/types/categorias';
import {
  criarCategoriaPadrao,
  criarSubeixoPadrao,
  normalizarCategoriasJson,
} from '@/utils/categoriaUtils';

export function useCategoriaEditorState() {
  const {
    categoriasIndicadores,
    setCategoriasIndicadores,
    loading,
    error,
  } = useCategoriasIndicadores();

  const [edicaoLocal, setEdicaoLocal] = useState<CategoriaIndicador[]>([]);

  const categoriasMemo = useMemo(() => categoriasIndicadores, [categoriasIndicadores]);

  useEffect(() => {
    const categoriasValidas =
      Array.isArray(categoriasMemo) && categoriasMemo.length > 0;

    if (categoriasValidas) {
      console.log('✅ Carregando categorias do banco de dados');
      setEdicaoLocal(categoriasMemo);
    } else {
      console.warn('⚠️ Nenhuma categoria encontrada. Usando padrão do JSON...');
      const padraoConvertido = normalizarCategoriasJson(categoriasPadrao);
      setEdicaoLocal(padraoConvertido);
    }
  }, [categoriasMemo]);

  // Ações
  const salvarAlteracoes = () => setCategoriasIndicadores(edicaoLocal);

  const deletarCategoria = (id: number) => {
    setEdicaoLocal((prev) => prev.filter((cat) => cat.id !== id));
  };

  const adicionarCategoria = () => {
    const novaCategoria = criarCategoriaPadrao();
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
