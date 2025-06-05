// src/hooks/useIndicadores.ts
import useSWR from 'swr';
import type { Indicador } from '@/types/indicadores';

export default function useIndicadores() {
  const { data, error, isLoading } = useSWR<Indicador[]>('/api/indicadores');

  return {
    indicadores: data ?? [],
    error,
    loading: isLoading,
  };
}
