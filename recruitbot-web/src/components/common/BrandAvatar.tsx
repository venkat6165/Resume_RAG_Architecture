import { StatusDot } from './StatusDot';

export function BrandAvatar() {
  return (
    <div className="flex items-center gap-3 pb-4 border-b border-white/[0.07]">
      <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20 shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-white"
        >
          <path d="M12 2a8 8 0 0 0-8 8c0 5.25 7 13 8 13s8-7.75 8-13a8 8 0 0 0-8-8z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      </div>
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm leading-tight text-text-primary truncate">RecruitBot AI</span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-primary/20 text-indigo-300">
            RAG
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-text-muted mt-1">
          <StatusDot />
          Online & Ready
        </span>
      </div>
    </div>
  );
}
