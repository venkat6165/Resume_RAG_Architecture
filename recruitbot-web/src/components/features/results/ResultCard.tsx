import { useState } from 'react';
import type { SearchResult, SearchMode } from '@/types/search.types';
import { RankBadge } from './RankBadge';
import { ScorePill } from './ScorePill';
import { useUIStore } from '@/lib/stores/ui.store';
import { useSearchStore } from '@/lib/stores/search.store';
import { searchApi } from '@/lib/api/search.api';
import toast from 'react-hot-toast';

interface ResultCardProps {
  result: SearchResult;
  searchType: SearchMode;
}

export function ResultCard({ result, searchType }: ResultCardProps) {
  const { openCandidateModal } = useUIStore();
  const { lastQuery, summaryStyle, updateCandidateSummary } = useSearchStore();
  const [isSummarizing, setIsSummarizing] = useState(false);
  const rank = result.rank || 1;

  function handleClick() {
    if (result.candidateId) {
      openCandidateModal(result.candidateId);
    }
  }

  async function handleSummarize(e: React.MouseEvent) {
    e.stopPropagation();
    if (isSummarizing) return;
    setIsSummarizing(true);
    try {
      const summaryText = await searchApi.summarizeCandidate(
        lastQuery || result.snippet || 'Candidate Evaluation',
        result,
        summaryStyle
      );
      updateCandidateSummary(result.candidateId || result.resumeId || '', summaryText);
      toast.success('⚡ AI Candidate Fit Summary generated!');
    } catch (err) {
      toast.error('Summarization request failed.');
    } finally {
      setIsSummarizing(false);
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

        <ScorePill score={result.score} searchType={searchType} sources={result.sources} isDeduplicated={result.isDeduplicated} />
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

      {/* Grounded AI Fit Summary or On-Demand Summarize Button */}
      {result.summary ? (
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/25 text-xs text-indigo-200 leading-relaxed shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-indigo-300 flex items-center gap-1 text-[11px] uppercase tracking-wider">
              ⚡ AI Candidate Fit Summary
            </span>
            <button
              onClick={handleSummarize}
              className="text-[10px] text-indigo-400 hover:text-indigo-200 underline font-medium"
              title="Regenerate fit summary"
            >
              {isSummarizing ? 'Generating...' : 'Re-summarize'}
            </button>
          </div>
          <p className="text-indigo-100">{result.summary}</p>
        </div>
      ) : (
        <div className="flex items-center">
          <button
            onClick={handleSummarize}
            disabled={isSummarizing}
            className="px-2.5 py-1 rounded-lg bg-primary/15 hover:bg-primary/25 border border-primary/30 text-indigo-300 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span>⚡</span>
            <span>{isSummarizing ? 'Generating AI Summary...' : 'Summarize Candidate Fit'}</span>
          </button>
        </div>
      )}

      {result.reason && (
        <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed">
          <div className="flex items-center gap-1 font-semibold text-indigo-300 mb-0.5">
            <span>🤖 LLM Re-rank Reasoning</span>
          </div>
          <p className="text-text-muted">{result.reason}</p>
        </div>
      )}

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
