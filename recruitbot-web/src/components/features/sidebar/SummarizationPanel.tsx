import { useSearchStore } from '@/lib/stores/search.store';

export function SummarizationPanel() {
  const { enableSummarize, summaryStyle, setEnableSummarize, setSummaryStyle } = useSearchStore();

  return (
    <div className="flex flex-col gap-3 p-3 bg-bg-card/70 border border-primary/20 rounded-xl animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">⚡</span>
          <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">
            AI Fit Summarizer
          </span>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enableSummarize}
            onChange={(e) => setEnableSummarize(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-8 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>

      {enableSummarize && (
        <div className="flex flex-col gap-1.5 pt-1">
          <span className="text-text-muted text-[11px]">Summary Format Style</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSummaryStyle('short')}
              className={`flex-1 py-1 rounded text-[11px] font-medium transition-colors ${
                summaryStyle === 'short'
                  ? 'bg-primary/20 text-indigo-300 border border-primary/30'
                  : 'bg-white/5 hover:bg-white/10 text-text-muted'
              }`}
            >
              Concise (1-2 sentences)
            </button>
            <button
              onClick={() => setSummaryStyle('detailed')}
              className={`flex-1 py-1 rounded text-[11px] font-medium transition-colors ${
                summaryStyle === 'detailed'
                  ? 'bg-primary/20 text-indigo-300 border border-primary/30'
                  : 'bg-white/5 hover:bg-white/10 text-text-muted'
              }`}
            >
              Detailed Bullets
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
