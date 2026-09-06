import type { SearchMode } from '@/types/search.types';

interface ResultSummaryProps {
  count: number;
  searchType: SearchMode;
  duration?: number;
  degraded?: boolean;
}

export function ResultSummary({ count, searchType, duration, degraded }: ResultSummaryProps) {
  const modeName =
    searchType === 'vector' ? 'Vector Search' : searchType === 'bm25' ? 'BM25 Keyword Search' : 'Hybrid RAG Search';

  return (
    <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-xs">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-text-primary">
          Found <span className="text-primary">{count}</span> candidate{count === 1 ? '' : 's'}
        </span>
        <span className="text-text-muted">•</span>
        <span className="text-text-muted">{modeName}</span>
        {degraded && (
          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-medium border border-amber-500/30">
            Degraded Mode
          </span>
        )}
      </div>

      {duration !== undefined && (
        <span className="text-text-muted font-mono text-[11px] bg-white/5 px-2 py-0.5 rounded">
          ⏱️ {duration} ms
        </span>
      )}
    </div>
  );
}
