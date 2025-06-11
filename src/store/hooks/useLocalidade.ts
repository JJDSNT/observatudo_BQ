// src/store/hooks/useLocalidade.ts
import { usePreferencesStore } from '@/store/preferencesStore';
import type { Localidade } from '@/types';

export function useLocalidade(): [Localidade, (loc: Localidade) => void] {
  const pais = usePreferencesStore((s) => s.selecionado.pais ?? '');
  const estado = usePreferencesStore((s) => s.selecionado.estado ?? '');
  const cidade = usePreferencesStore((s) => s.selecionado.cidade ?? '');
  const setSelecionado = usePreferencesStore((s) => s.setSelecionado);

  const localidade: Localidade = { pais, estado, cidade };

  const setLocalidade = (loc: Localidade) => {
    if (
      loc.pais !== pais ||
      loc.estado !== estado ||
      loc.cidade !== cidade
    ) {
      setSelecionado({
        pais: loc.pais,
        estado: loc.estado,
        cidade: loc.cidade,
      });
    }
  };

  return [localidade, setLocalidade];
}
