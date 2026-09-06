import { useSearchStore } from '@/lib/stores/search.store';

export function ResultsLimitSelect() {
  const { topK, setTopK } = useSearchStore();

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted px-1">
        Results Limit
      </span>
      <div className="flex items-center gap-2 bg-bg-card/40 border border-white/5 rounded-xl p-2">
        <span className="text-xs text-text-muted pl-1">Show top</span>
        <select
          value={topK}
          onChange={(e) => setTopK(Number(e.target.value))}
          className="flex-1 bg-bg-surface border border-white/10 text-text-primary text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-primary cursor-pointer"
        >
          <option value={3}>3 candidates</option>
          <option value={5}>5 candidates (default)</option>
          <option value={10}>10 candidates</option>
          <option value={20}>20 candidates</option>
        </select>
      </div>
    </div>
  );
}
