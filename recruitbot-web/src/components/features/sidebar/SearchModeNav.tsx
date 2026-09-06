import type { SearchMode } from '@/types/search.types';

interface SearchModeNavProps {
  activeMode: SearchMode;
  onChange: (mode: SearchMode) => void;
}

const modes: { id: SearchMode; title: string; desc: string; badgeColor: string; activeClass: string }[] = [
  {
    id: 'vector',
    title: 'Vector Search',
    desc: '1024-dim Mistral semantic similarity',
    badgeColor: 'text-score-vector',
    activeClass: 'bg-score-vector/10 border-score-vector/40 text-text-primary',
  },
  {
    id: 'bm25',
    title: 'BM25 Keyword',
    desc: 'Lexical index with field weighting',
    badgeColor: 'text-score-bm25',
    activeClass: 'bg-score-bm25/10 border-score-bm25/40 text-text-primary',
  },
  {
    id: 'hybrid',
    title: 'Hybrid RAG',
    desc: 'Parallel vector + lexical re-ranked',
    badgeColor: 'text-score-hybrid',
    activeClass: 'bg-score-hybrid/10 border-score-hybrid/40 text-text-primary',
  },
];

export function SearchModeNav({ activeMode, onChange }: SearchModeNavProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted px-1">
        Search Mode
      </span>
      {modes.map((mode) => {
        const isActive = activeMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onChange(mode.id)}
            className={`flex items-start justify-between p-3 rounded-xl border transition-all duration-200 text-left ${
              isActive
                ? mode.activeClass
                : 'border-white/5 bg-bg-card/40 hover:bg-bg-card hover:border-white/10 text-text-muted'
            }`}
          >
            <div className="flex flex-col gap-0.5">
              <span className={`text-xs font-semibold ${isActive ? 'text-text-primary' : 'text-text-primary/90'}`}>
                {mode.title}
              </span>
              <span className="text-[11px] text-text-muted leading-snug">{mode.desc}</span>
            </div>
            {isActive && (
              <span className={`text-xs font-bold ${mode.badgeColor}`}>✓</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
