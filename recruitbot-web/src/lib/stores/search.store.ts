import { create } from 'zustand';
import type { SearchMode, SearchResult } from '@/types/search.types';

interface SearchState {
  searchType: SearchMode;
  bm25Weight: number;
  vectorWeight: number;
  topK: number;
  enableRerank: boolean;
  rerankTopN: number;
  enableDeduplication: boolean;
  deduplicatedCount: number;
  enableSummarize: boolean;
  summaryStyle: 'short' | 'detailed';
  results: SearchResult[];
  isSearching: boolean;
  lastQuery: string;
  lastTimings?: Record<string, number>;
  setSearchType: (mode: SearchMode) => void;
  setWeights: (bm25: number, vector: number) => void;
  setTopK: (k: number) => void;
  setEnableRerank: (v: boolean) => void;
  setRerankTopN: (n: number) => void;
  setEnableDeduplication: (v: boolean) => void;
  setEnableSummarize: (v: boolean) => void;
  setSummaryStyle: (style: 'short' | 'detailed') => void;
  updateCandidateSummary: (candidateId: string, summary: string) => void;
  setResults: (results: SearchResult[], query: string, timings?: Record<string, number>, deduplicatedCount?: number) => void;
  setSearching: (v: boolean) => void;
  deduplicateCurrentResults: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  searchType: 'vector',
  bm25Weight: 50,
  vectorWeight: 50,
  topK: 5,
  enableRerank: true,
  rerankTopN: 10,
  enableDeduplication: true,
  deduplicatedCount: 0,
  enableSummarize: true,
  summaryStyle: 'short',
  results: [],
  isSearching: false,
  lastQuery: '',
  lastTimings: undefined,
  setSearchType: (mode: SearchMode) => set({ searchType: mode }),
  setWeights: (bm25: number, vector: number) => set({ bm25Weight: bm25, vectorWeight: vector }),
  setTopK: (k: number) => set({ topK: k }),
  setEnableRerank: (v: boolean) => set({ enableRerank: v }),
  setRerankTopN: (n: number) => set({ rerankTopN: n }),
  setEnableDeduplication: (v: boolean) => set({ enableDeduplication: v }),
  setEnableSummarize: (v: boolean) => set({ enableSummarize: v }),
  setSummaryStyle: (style: 'short' | 'detailed') => set({ summaryStyle: style }),
  updateCandidateSummary: (candidateId: string, summary: string) =>
    set((state) => ({
      results: state.results.map((r) =>
        r.candidateId === candidateId || r.resumeId === candidateId ? { ...r, summary } : r
      ),
    })),
  setResults: (results: SearchResult[], query: string, timings?: Record<string, number>, deduplicatedCount = 0) => set({ results, lastQuery: query, lastTimings: timings, deduplicatedCount }),
  setSearching: (v: boolean) => set({ isSearching: v }),
  deduplicateCurrentResults: () => {
    set((state) => {
      const uniqueMap = new Map<string, SearchResult>();
      let mergedCount = 0;

      for (const res of state.results) {
        const key = (res.name || res.candidateId || '').toLowerCase().trim();
        if (uniqueMap.has(key)) {
          mergedCount++;
          const existing = uniqueMap.get(key)!;
          const mergedSources = Array.from(new Set([...(existing.sources || []), ...(res.sources || [])]));
          uniqueMap.set(key, {
            ...existing,
            sources: mergedSources as ('bm25' | 'vector')[],
            isDeduplicated: true,
          });
        } else {
          uniqueMap.set(key, {
            ...res,
            isDeduplicated: (res.sources && res.sources.length > 1) || res.isDeduplicated || false,
          });
        }
      }

      const deduplicatedResults = Array.from(uniqueMap.values());
      return {
        results: deduplicatedResults,
        deduplicatedCount: mergedCount > 0 ? mergedCount : (state.deduplicatedCount > 0 ? state.deduplicatedCount : (deduplicatedResults.filter(r => r.isDeduplicated).length || 1)),
      };
    });
  },
}));
