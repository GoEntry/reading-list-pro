type Variant = 'empty' | 'no-results' | 'error';

interface Props {
  variant: Variant;
  onClearFilters?: () => void;
  onRetry?: () => void;
}

const CONFIG: Record<Variant, { icon: string; message: string }> = {
  empty:        { icon: '📚', message: 'No bookmarks yet. Save your first page!' },
  'no-results': { icon: '🔍', message: 'No bookmarks match your search.' },
  error:        { icon: '⚠️', message: "Couldn't load bookmarks." },
};

export function EmptyState({ variant, onClearFilters, onRetry }: Props) {
  const { icon, message } = CONFIG[variant];
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-12 px-6 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-sm text-slate-400">{message}</p>
      {variant === 'no-results' && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 underline"
        >
          Clear filters
        </button>
      )}
      {variant === 'error' && onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 underline"
        >
          Retry
        </button>
      )}
    </div>
  );
}
