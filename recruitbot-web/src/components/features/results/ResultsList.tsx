import type { SearchResult, SearchMode } from '@/types/search.types';
import { ResultSummary } from './ResultSummary';
import { ResultCard } from './ResultCard';
import { EmptyState } from './EmptyState';

interface ResultsListProps {
  results: SearchResult[];
  searchType: SearchMode;
  duration?: number;
  degraded?: boolean;
}

export function ResultsList({ results, searchType, duration, degraded }: ResultsListProps) {
  if (!results || results.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-3 w-full animate-fade-in">
      <ResultSummary
        count={results.length}
        searchType={searchType}
        duration={duration}
        degraded={degraded}
      />

      <div className="flex flex-col gap-3">
        {results.map((result) => (
          <ResultCard key={result.candidateId} result={result} searchType={searchType} />
        ))}
      </div>
    </div>
  );
}
