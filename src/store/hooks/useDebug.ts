// src/store/hooks/useDebug.ts
import { usePreferencesStore } from '@/store/preferencesStore';
import type { DebugConfig } from '@/types';

export function useDebug(): [
  DebugConfig,
  (debug: DebugConfig) => void,
  (mod: keyof DebugConfig['modules'], val: boolean) => void
] {
  const debug = usePreferencesStore((s) => s.debug);
  const setDebug = usePreferencesStore((s) => s.setDebug);
  const setDebugModule = usePreferencesStore((s) => s.setDebugModule);

  return [debug, setDebug, setDebugModule];
}
