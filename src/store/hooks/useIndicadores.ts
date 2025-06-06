// src/store/hooks/useIndicadores.ts
import { useIndicadoresCache } from '../useIndicadoresCache';
import { useLocalizacao } from './usePreferences';
import { fetchIndicadoresFromAPI } from '../services/indicadoresService';

export const useIndicadores = () => {
  const { localizacao } = useLocalizacao();
  const {
    getIndicadores,
    setIndicadores,
    clearIndicadores
  } = useIndicadoresCache();

  const categoriaId = localizacao.eixo.toString();
  const estado = localizacao.estado;
  const cidade = localizacao.cidade;

  const cache = getIndicadores(estado, cidade, categoriaId);

  const fetchIndicadoresIfNeeded = async () => {
    if (cache) return;

    try {
      const data = await fetchIndicadoresFromAPI(estado, cidade, categoriaId);
      setIndicadores(estado, cidade, categoriaId, data);
    } catch (error) {
      console.error('Erro ao buscar indicadores:', error);
    }
  };

  return {
    indicadores: cache,
    setIndicadores,
    getIndicadores,
    clearIndicadores,
    fetchIndicadoresIfNeeded
  };
};
