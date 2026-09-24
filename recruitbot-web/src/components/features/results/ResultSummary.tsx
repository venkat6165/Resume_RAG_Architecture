import type { SearchMode } from '@/types/search.types';
import { useSearchStore } from '@/lib/stores/search.store';
import toast from 'react-hot-toast';

interface ResultSummaryProps {
  count: number;
  searchType: SearchMode;
  duration?: number;
  degraded?: boolean;
}

export function ResultSummary({ count, searchType, duration, degraded }: ResultSummaryProps) {
  const { lastTimings, deduplicatedCount, deduplicateCurrentResults } = useSearchStore();
  const modeName =
    searchType === 'vector' ? 'Vector Search' : searchType === 'bm25' ? 'BM25 Keyword Search' : 'Hybrid RAG Search';

  const rerankMs = lastTimings?.rerankMs;
  const summarizeMs = lastTimings?.summarizeMs;

  function handleDeduplicateClick() {
    deduplicateCurrentResults();
    toast.success('✨ Candidates deduplicated! Duplicate profiles merged across streams.');
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-white/10 text-xs">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-semibold text-text-primary">
          Found <span className="text-primary">{count}</span> candidate{count === 1 ? '' : 's'}
        </span>
        <span className="text-text-muted">•</span>
        <span className="text-text-muted">{modeName}</span>

        {/* Deduplicate Interactive Button */}
        <button
          onClick={handleDeduplicateClick}
          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1 border ${
            deduplicatedCount > 0
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
              : 'bg-white/5 hover:bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
          }`}
          title="Click to merge duplicate candidates across BM25 & Vector streams"
        >
          <span>⚡</span>
          <span>{deduplicatedCount > 0 ? `Deduplicated (${deduplicatedCount} Merged)` : 'Deduplicate Results'}</span>
        </button>

        {degraded && (
          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-medium border border-amber-500/30">
            Degraded Mode
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 font-mono text-[11px]">
        {rerankMs !== undefined && rerankMs > 0 && (
          <span className="text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
            🤖 LLM Rerank: {rerankMs}ms
          </span>
        )}
        {summarizeMs !== undefined && summarizeMs > 0 && (
          <span className="text-indigo-300 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
            ⚡ AI Summary: {summarizeMs}ms
          </span>
        )}
        {duration !== undefined && (
          <span className="text-text-muted bg-white/5 px-2 py-0.5 rounded">
            ⏱️ {duration} ms
          </span>
        )}
      </div>
    </div>
  );
}
