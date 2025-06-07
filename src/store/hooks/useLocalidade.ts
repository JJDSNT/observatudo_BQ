// src/store/hooks/useLocalidade.ts
import { usePreferencesStore } from '@/store/preferencesStore';
import type { Localidade } from '@/types';

export function useLocalidade(): [Localidade, (loc: Localidade) => void] {
  const estado = usePreferencesStore((s) => s.selecionado.estado ?? '');
  const cidade = usePreferencesStore((s) => s.selecionado.cidade ?? '');
  const selecionado = usePreferencesStore((s) => s.selecionado);
  const setSelecionado = usePreferencesStore((s) => s.setSelecionado);

  const localidade: Localidade = { estado, cidade };

  const setLocalidade = (loc: Localidade) => {
    setSelecionado({
      ...selecionado,
      estado: loc.estado,
      cidade: loc.cidade,
    });
  };

  return [localidade, setLocalidade];
}
