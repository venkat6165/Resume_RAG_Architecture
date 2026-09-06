import { create } from 'zustand';
import type { SearchMode, SearchResult } from '@/types/search.types';

interface SearchState {
  searchType: SearchMode;
  bm25Weight: number;
  vectorWeight: number;
  topK: number;
  results: SearchResult[];
  isSearching: boolean;
  lastQuery: string;
  lastTimings?: Record<string, number>;
  setSearchType: (mode: SearchMode) => void;
  setWeights: (bm25: number, vector: number) => void;
  setTopK: (k: number) => void;
  setResults: (results: SearchResult[], query: string, timings?: Record<string, number>) => void;
  setSearching: (v: boolean) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  searchType: 'vector',
  bm25Weight: 50,
  vectorWeight: 50,
  topK: 5,
  results: [],
  isSearching: false,
  lastQuery: '',
  lastTimings: undefined,
  setSearchType: (mode: SearchMode) => set({ searchType: mode }),
  setWeights: (bm25: number, vector: number) => set({ bm25Weight: bm25, vectorWeight: vector }),
  setTopK: (k: number) => set({ topK: k }),
  setResults: (results: SearchResult[], query: string, timings?: Record<string, number>) => set({ results, lastQuery: query, lastTimings: timings }),
  setSearching: (v: boolean) => set({ isSearching: v }),
}));
