// src/components/debug/DebugZustandPanel.tsx
'use client';

import { useDebug } from '@/store/hooks/useDebug';
import { usePreferencesStore } from '@/store/preferencesStore';

const debugKeys = ['zustand', 'pwa', 'latency', 'latencyMonitor'] as const;

export default function DebugZustandPanel() {
  const [debug, , setDebugModule] = useDebug();
  const state = usePreferencesStore.getState();

  const handleClear = () => {
    // Limpa Zustand
    usePreferencesStore.setState({}, false);

    // Limpa localStorage
    localStorage.removeItem('user-preferences-storage');

    // Opcional: força recarregamento
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white dark:bg-zinc-900 border rounded shadow-lg z-50 w-[400px] max-h-[90vh] overflow-auto text-sm">
      <h2 className="font-bold mb-2 text-zinc-800 dark:text-zinc-100">
        🧠 Zustand Debug Panel
      </h2>

      <section className="mb-3">
        <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
          Selecionado
        </h3>
        <pre className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded text-xs overflow-x-auto text-zinc-700 dark:text-zinc-200">
          {JSON.stringify(state.selecionado, null, 2)}
        </pre>
      </section>

      <section className="mb-3">
        <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
          Categorias Indicadores
        </h3>
        <pre className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded text-xs overflow-x-auto text-zinc-700 dark:text-zinc-200">
          {JSON.stringify(state.categoriasIndicadores, null, 2)}
        </pre>
      </section>

      <section className="mb-3">
        <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
          Debug State
        </h3>
        <pre className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded text-xs overflow-x-auto text-zinc-700 dark:text-zinc-200">
          {JSON.stringify(debug, null, 2)}
        </pre>
      </section>

      <section className="mb-4">
        <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
          Módulos
        </h3>
        <div className="flex flex-col gap-2">
          {debugKeys.map((mod) => (
            <label key={mod} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={debug[mod] ?? false}
                onChange={(e) => setDebugModule(mod, e.target.checked)}
              />
              <span className="capitalize">{mod}</span>
            </label>
          ))}
        </div>
      </section>

      <button
        onClick={handleClear}
        className="w-full py-2 px-4 rounded bg-red-600 hover:bg-red-700 text-white font-semibold"
      >
        🧹 Limpar Zustand + LocalStorage
      </button>
    </div>
  );
}
