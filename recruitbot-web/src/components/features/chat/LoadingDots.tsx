export function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1 px-2">
      <span className="h-2 w-2 rounded-full bg-primary animate-dot-bounce" style={{ animationDelay: '0ms' }} />
      <span className="h-2 w-2 rounded-full bg-accent animate-dot-bounce" style={{ animationDelay: '150ms' }} />
      <span className="h-2 w-2 rounded-full bg-indigo-300 animate-dot-bounce" style={{ animationDelay: '300ms' }} />
      <span className="text-xs text-text-muted ml-2 font-mono">Searching candidate database & re-ranking...</span>
    </div>
  );
}
