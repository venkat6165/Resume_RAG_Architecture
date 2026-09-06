export type SearchMode = 'vector' | 'bm25' | 'hybrid';

export interface SearchFilters {
  minYearsExperience?: number;
  maxYearsExperience?: number;
  skills?: string[];
  location?: string;
}

export interface SearchOptions {
  bm25TopK?: number;
  vectorTopK?: number;
  rerankTopN?: number;
  finalTopK?: number;
  summarize?: boolean;
  summaryStyle?: 'short' | 'detailed';
}

export interface SearchRequest {
  query: string;
  searchType: 'vector' | 'keyword' | 'hybrid';
  topK?: number;
  bm25Weight?: number;
  vectorWeight?: number;
  filters?: SearchFilters;
  options?: SearchOptions;
}

export interface SearchResult {
  candidateId: string;
  resumeId?: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  phone?: string;
  role?: string;
  company?: string;
  score: number;
  relevanceScore?: number;
  bm25Score?: number;
  vectorScore?: number;
  experienceYears?: number;
  totalExperience?: number;
  skills?: string[];
  snippet: string;
  summary?: string;
  sources?: ('bm25' | 'vector')[];
  reason?: string;
  rank?: number;
}

export interface SearchResponse {
  query: string;
  searchType?: string;
  mode?: string;
  topK?: number;
  resultCount?: number;
  duration?: number;
  degraded?: boolean;
  warnings?: string[];
  results: SearchResult[];
  timings?: {
    embeddingMs?: number;
    bm25Ms?: number;
    vectorMs?: number;
    rerankMs?: number;
    summarizeMs?: number;
    totalMs?: number;
  };
}
