import { useSearchStore } from '@/lib/stores/search.store';

export function RerankSettingsPanel() {
  const { enableRerank, rerankTopN, setEnableRerank, setRerankTopN } = useSearchStore();

  return (
    <div className="flex flex-col gap-3 p-3 bg-bg-card/70 border border-indigo-500/20 rounded-xl animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🤖</span>
          <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">
            LLM Re-Ranking
          </span>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enableRerank}
            onChange={(e) => setEnableRerank(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-8 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-500"></div>
        </label>
      </div>

      {enableRerank && (
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-text-muted text-[11px]">Re-rank Top Candidates</span>
            <span className="font-mono text-indigo-300 font-semibold">{rerankTopN}</span>
          </div>

          <input
            type="range"
            min="3"
            max="20"
            step="1"
            value={rerankTopN}
            onChange={(e) => setRerankTopN(Number(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-400"
          />

          <div className="flex justify-between text-[10px] text-text-muted px-0.5">
            <span>3</span>
            <span>10</span>
            <span>20</span>
          </div>
        </div>
      )}
    </div>
  );
}
