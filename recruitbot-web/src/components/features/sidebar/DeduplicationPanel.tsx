import { useSearchStore } from '@/lib/stores/search.store';

export function DeduplicationPanel() {
  const { enableDeduplication, setEnableDeduplication, deduplicatedCount } = useSearchStore();

  return (
    <div className="flex flex-col gap-2.5 p-3 bg-bg-card/70 border border-emerald-500/20 rounded-xl animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">✨</span>
          <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
            Deduplication Engine
          </span>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enableDeduplication}
            onChange={(e) => setEnableDeduplication(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-8 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>
      </div>

      <p className="text-[11px] text-text-muted leading-tight">
        Automatically merges duplicate candidate profiles across BM25 & Vector retrieval streams.
      </p>

      {enableDeduplication && deduplicatedCount > 0 && (
        <div className="flex items-center gap-1.5 pt-1 text-[11px] font-medium text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
          <span>✓</span>
          <span>{deduplicatedCount} duplicate profiles merged</span>
        </div>
      )}
    </div>
  );
}
