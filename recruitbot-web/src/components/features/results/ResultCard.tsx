import type { SearchResult, SearchMode } from '@/types/search.types';
import { RankBadge } from './RankBadge';
import { ScorePill } from './ScorePill';
import { useUIStore } from '@/lib/stores/ui.store';

interface ResultCardProps {
  result: SearchResult;
  searchType: SearchMode;
}

export function ResultCard({ result, searchType }: ResultCardProps) {
  const { openCandidateModal } = useUIStore();
  const rank = result.rank || 1;

  function handleClick() {
    if (result.candidateId) {
      openCandidateModal(result.candidateId);
    }
  }

  return (
    <div
      onClick={handleClick}
      className="group flex flex-col gap-3 p-4 bg-bg-card/70 border border-white/10 hover:border-primary/50 hover:bg-bg-card rounded-2xl transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl hover:shadow-primary/5 select-none"
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <RankBadge rank={rank} />
          <div className="flex flex-col min-w-0">
            <h4 className="font-semibold text-sm text-text-primary group-hover:text-indigo-300 transition-colors truncate">
              {result.name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-text-muted truncate">
              {result.role && <span>{result.role}</span>}
              {result.role && result.company && <span>•</span>}
              {result.company && <span>{result.company}</span>}
            </div>
          </div>
        </div>

        <ScorePill score={result.score} searchType={searchType} sources={result.sources} />
      </div>

      {/* Experience & Contact Tags */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-muted">
        {result.experienceYears !== undefined && result.experienceYears > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 font-medium">
            💼 {result.experienceYears} Years Exp
          </span>
        )}
        {result.email && (
          <span className="px-2 py-0.5 rounded-full bg-white/5 text-text-muted truncate max-w-[200px]">
            ✉️ {result.email}
          </span>
        )}
        {result.phone && (
          <span className="px-2 py-0.5 rounded-full bg-white/5 text-text-muted">
            📞 {result.phone}
          </span>
        )}
      </div>

      {/* Grounded Summary or Reason */}
      {result.summary ? (
        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-indigo-200 leading-relaxed">
          <span className="font-semibold text-indigo-300">Fit Summary: </span>
          {result.summary}
        </div>
      ) : result.reason ? (
        <div className="p-2.5 rounded-xl bg-white/5 text-xs text-text-muted leading-relaxed">
          <span className="font-medium text-text-primary">Reasoning: </span>
          {result.reason}
        </div>
      ) : null}

      {/* Content Snippet */}
      {result.snippet && (
        <p className="text-xs text-text-muted/90 line-clamp-2 leading-relaxed font-sans bg-black/20 p-2 rounded-lg">
          "{result.snippet}"
        </p>
      )}

      {/* Skills Chips Cloud */}
      {result.skills && result.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {result.skills.slice(0, 7).map((skill, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 text-[11px] font-medium border border-indigo-500/20"
            >
              {skill}
            </span>
          ))}
          {result.skills.length > 7 && (
            <span className="text-[10px] text-text-muted self-center px-1">
              +{result.skills.length - 7} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
