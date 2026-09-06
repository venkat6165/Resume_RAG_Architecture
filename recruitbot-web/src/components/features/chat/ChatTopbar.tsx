import { useSearchStore } from '@/lib/stores/search.store';
import { useUIStore } from '@/lib/stores/ui.store';

export function ChatTopbar() {
  const { searchType } = useSearchStore();
  const { toggleMobileSidebar } = useUIStore();

  const modeBadgeText =
    searchType === 'vector'
      ? 'Vector Search · Semantic'
      : searchType === 'bm25'
      ? 'BM25 Keyword · Lexical'
      : 'Hybrid RAG · Parallel Vector + BM25';

  const modeBadgeClass =
    searchType === 'vector'
      ? 'bg-score-vector/20 text-score-vector border-score-vector/30'
      : searchType === 'bm25'
      ? 'bg-score-bm25/20 text-score-bm25 border-score-bm25/30'
      : 'bg-score-hybrid/20 text-score-hybrid border-score-hybrid/30';

  return (
    <header className="h-14 border-b border-white/[0.07] bg-bg-surface/50 backdrop-blur px-4 md:px-6 flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Open Navigation Sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-bold text-white text-xs shadow-md shrink-0">
          AI
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-xs text-text-primary leading-tight truncate">RecruitBot Assistant</span>
          <span className="text-[10px] text-text-muted hidden sm:inline">163 stored MongoDB candidate resumes</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={`text-[11px] md:text-xs px-2.5 py-0.5 rounded-full border font-medium transition-all ${modeBadgeClass}`}>
          {modeBadgeText}
        </span>
      </div>
    </header>
  );
}
