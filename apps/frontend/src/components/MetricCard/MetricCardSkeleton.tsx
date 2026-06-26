export function MetricCardSkeleton() {
  return (
    <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden animate-pulse">
      <div className="w-1 flex-shrink-0 rounded-l-xl bg-gray-200 dark:bg-gray-700" />
      <div className="flex-1 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        </div>
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-2/5" />
        <div className="h-10 bg-gray-100 dark:bg-gray-700/50 rounded" />
        <div className="flex gap-3 pt-1">
          <div className="h-2.5 bg-gray-100 dark:bg-gray-700/50 rounded flex-1" />
          <div className="h-2.5 bg-gray-100 dark:bg-gray-700/50 rounded flex-1" />
          <div className="h-2.5 bg-gray-100 dark:bg-gray-700/50 rounded flex-1" />
        </div>
      </div>
    </div>
  );
}
