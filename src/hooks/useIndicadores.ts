// src/hooks/useIndicadores.ts
import useSWR from 'swr';
import type { Indicador } from '@/types/oldindicadores';

export default function useIndicadores() {
  const { data, error, isLoading } = useSWR<Indicador[]>('/api/indicadores/list');

  return {
    indicadores: data ?? [],
    error,
    loading: isLoading,
  };
}
