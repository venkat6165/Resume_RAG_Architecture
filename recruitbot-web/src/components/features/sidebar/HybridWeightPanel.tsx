import { useHybridWeights } from '@/hooks/use-hybrid-weights';

export function HybridWeightPanel() {
  const { bm25Weight, vectorWeight, handleBm25Change, applyPreset } = useHybridWeights();

  return (
    <div className="flex flex-col gap-3 p-3 bg-bg-card/70 border border-score-hybrid/20 rounded-xl animate-fade-in">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-score-hybrid uppercase tracking-wider">
          Hybrid Weights
        </span>
        <span className="text-xs font-mono text-text-muted">
          BM25: {bm25Weight}% / Vector: {vectorWeight}%
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={bm25Weight}
          onChange={(e) => handleBm25Change(Number(e.target.value))}
          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
        />
        <div className="flex justify-between text-[10px] text-text-muted px-0.5">
          <span>Vector Dominant</span>
          <span>Balanced</span>
          <span>Keyword Dominant</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 pt-1">
        <button
          onClick={() => applyPreset(50, 50)}
          className={`flex-1 py-1 rounded text-[11px] font-medium transition-colors ${
            bm25Weight === 50
              ? 'bg-score-hybrid/20 text-score-hybrid border border-score-hybrid/30'
              : 'bg-white/5 hover:bg-white/10 text-text-muted'
          }`}
        >
          50 / 50
        </button>
        <button
          onClick={() => applyPreset(30, 70)}
          className={`flex-1 py-1 rounded text-[11px] font-medium transition-colors ${
            bm25Weight === 30
              ? 'bg-score-hybrid/20 text-score-hybrid border border-score-hybrid/30'
              : 'bg-white/5 hover:bg-white/10 text-text-muted'
          }`}
        >
          30 / 70
        </button>
        <button
          onClick={() => applyPreset(70, 30)}
          className={`flex-1 py-1 rounded text-[11px] font-medium transition-colors ${
            bm25Weight === 70
              ? 'bg-score-hybrid/20 text-score-hybrid border border-score-hybrid/30'
              : 'bg-white/5 hover:bg-white/10 text-text-muted'
          }`}
        >
          70 / 30
        </button>
      </div>
    </div>
  );
}
