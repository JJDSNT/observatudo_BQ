// store/hooks/useDebug.ts
import { usePreferencesStore } from '../preferencesStore';

export const useDebug = () =>
  usePreferencesStore((state) => state.debug);
