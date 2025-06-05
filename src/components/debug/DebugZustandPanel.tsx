'use client';

import { useUserPreferences } from '@/store/useUserPreferences';

export default function DebugZustandPanel() {
  const { preferences, setPreferences, clearPreferences } = useUserPreferences();

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white dark:bg-zinc-900 border rounded shadow-lg z-50 w-[360px] max-h-[80vh] overflow-auto text-sm">
      <h2 className="font-bold mb-2 text-zinc-800 dark:text-zinc-100">🧠 Zustand Debug Panel</h2>

      <pre className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded text-xs overflow-x-auto text-zinc-700 dark:text-zinc-200">
        {JSON.stringify(preferences, null, 2)}
      </pre>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => {
            setPreferences({ tema: 'escuro' });
          }}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Forçar tema escuro
        </button>

        <button
          onClick={clearPreferences}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Limpar store
        </button>
      </div>
    </div>
  );
}
