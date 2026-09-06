import type { SearchMode } from '@/types/search.types';

interface ScorePillProps {
  score: number;
  searchType: SearchMode;
  sources?: ('bm25' | 'vector')[];
}

export function ScorePill({ score, searchType, sources }: ScorePillProps) {
  const displayScore = score > 1 ? score.toFixed(1) : Math.round(score * 100) + '%';

  const pillClass =
    searchType === 'vector'
      ? 'bg-score-vector/15 text-score-vector border-score-vector/30'
      : searchType === 'bm25'
      ? 'bg-score-bm25/15 text-score-bm25 border-score-bm25/30'
      : 'bg-score-hybrid/15 text-score-hybrid border-score-hybrid/30';

  const label = searchType === 'vector' ? 'Similarity' : searchType === 'bm25' ? 'BM25 Score' : 'Relevance';

  return (
    <div className="flex items-center gap-1.5">
      <div className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold font-mono ${pillClass}`}>
        {displayScore} <span className="text-[10px] opacity-80 font-sans uppercase">{label}</span>
      </div>

      {sources && sources.length > 0 && (
        <div className="flex items-center gap-1">
          {sources.includes('bm25') && (
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30 uppercase">
              BM25
            </span>
          )}
          {sources.includes('vector') && (
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
              Vector
            </span>
          )}
        </div>
      )}
    </div>
  );
}
