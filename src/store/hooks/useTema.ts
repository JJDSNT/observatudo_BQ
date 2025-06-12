// src/store/hooks/useTema.ts
import { usePreferencesStore } from '../preferencesStore';

export const useTema = () => {
  const tema = usePreferencesStore((state) => state.tema);
  const setTema = usePreferencesStore((state) => state.setTema);
  return { tema, setTema };
};
