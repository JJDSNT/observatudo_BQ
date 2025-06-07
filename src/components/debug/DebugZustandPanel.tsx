//src/components/debug/DebugZustandPanel.tsx
'use client';

import { useDebug } from '@/store/hooks/useDebug';

export default function DebugZustandPanel() {
  const [debug, , setDebugModule] = useDebug();

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white dark:bg-zinc-900 border rounded shadow-lg z-50 w-[360px] max-h-[80vh] overflow-auto text-sm">
      <h2 className="font-bold mb-2 text-zinc-800 dark:text-zinc-100">🧠 Zustand Debug Panel</h2>

      <pre className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded text-xs overflow-x-auto text-zinc-700 dark:text-zinc-200">
        {JSON.stringify(debug, null, 2)}
      </pre>

      <div className="mt-3 flex flex-col gap-2">
        {Object.entries(debug.modules ?? {}).map(([mod, val]) => (
          <label key={mod} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={val}
              onChange={(e) => setDebugModule(mod as keyof typeof debug.modules, e.target.checked)}
            />
            <span className="capitalize">{mod}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
