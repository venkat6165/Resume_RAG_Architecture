export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-bg-card/30 border border-white/5 rounded-2xl gap-3">
      <div className="h-12 w-12 rounded-full bg-white/5 text-text-muted flex items-center justify-center text-xl">
        🔍
      </div>
      <div>
        <h4 className="text-sm font-semibold text-text-primary">No Matching Candidates Found</h4>
        <p className="text-xs text-text-muted mt-1 max-w-sm">
          Try adjusting your query keywords, lowering minimum experience filters, or switching to Hybrid RAG mode.
        </p>
      </div>
    </div>
  );
}
