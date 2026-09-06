export interface SearchQueryInput {
  query: string;
  topK?: number;
  minScore?: number;
  skills?: string[];
  role?: string;
  minExperience?: number;
}

export interface Candidate {
  id: string;
  fileName: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  company?: string;
  role?: string;
  education?: string;
  totalExperience?: number;
  skills: string[];
  jobTitles?: string[];
  experienceSummary?: string;
  score?: number;
  bm25Score?: number;
  vectorScore?: number;
  sources?: ('bm25' | 'vector')[];
  snippet?: string;
  llmRank?: number;
  llmReasoning?: string;
  fitScore?: number;
}

export interface SearchTimings {
  queryEmbedMs?: number;
  bm25SearchMs?: number;
  vectorSearchMs?: number;
  hybridMergeMs?: number;
  llmRerankMs?: number;
  totalMs?: number;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  totalCandidates: number;
  candidates: Candidate[];
  timings?: SearchTimings;
}
