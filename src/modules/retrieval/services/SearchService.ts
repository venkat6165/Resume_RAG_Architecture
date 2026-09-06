import { resumeRepository } from '../repositories/ResumeRepository';
import { embeddingService } from '../../../shared/services/EmbeddingService';
import { Candidate, SearchQueryInput, SearchResponse } from '../types/retrieval.types';
import { mergeAndDeduplicateCandidates } from '../utils/deduplicate';
import { llmService } from './LLMService';

export class SearchService {
  async bm25Search(
    query: string,
    filters?: { minYearsExperience?: number },
    topK = 20
  ): Promise<Candidate[]> {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new Error('Search query text is required');
    }

    const candidates = await resumeRepository.searchBM25(query.trim(), {
      topK,
      minYearsExperience: filters?.minYearsExperience,
    });

    return candidates.map((c) => ({
      ...c,
      sources: ['bm25'],
      score: c.score || c.bm25Score || 0,
      snippet: c.snippet || c.experienceSummary || c.role || (c.skills && c.skills.length > 0 ? c.skills.join(', ') : undefined),
    }));
  }

  async vectorSearch(
    query: string,
    filters?: { minYearsExperience?: number },
    topK = 20
  ): Promise<Candidate[]> {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new Error('Search query text is required');
    }

    const queryVector = await embeddingService.generateEmbedding(query.trim());

    const candidates = await resumeRepository.searchVector(queryVector, {
      topK,
      minYearsExperience: filters?.minYearsExperience,
    });

    return candidates.map((c) => ({
      ...c,
      sources: ['vector'],
      score: c.score || c.vectorScore || 0,
      snippet: c.snippet || c.experienceSummary || c.role || (c.skills && c.skills.length > 0 ? c.skills.join(', ') : undefined),
    }));
  }

  async hybridSearch(
    query: string,
    filters?: { minYearsExperience?: number },
    topK = 20
  ): Promise<{
    mode: string;
    query: string;
    bm25: Candidate[];
    vector: Candidate[];
    timings: {
      bm25Ms: number;
      embeddingMs: number;
      vectorMs: number;
      totalMs: number;
    };
  }> {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new Error('Search query text is required');
    }

    const startTime = Date.now();

    let bm25Ms = 0;
    let embeddingMs = 0;
    let vectorMs = 0;

    const bm25Promise = (async () => {
      const t0 = Date.now();
      const results = await this.bm25Search(query, filters, topK);
      bm25Ms = Date.now() - t0;
      return results;
    })();

    const vectorPromise = (async () => {
      const t0 = Date.now();
      const queryVector = await embeddingService.generateEmbedding(query.trim());
      embeddingMs = Date.now() - t0;

      const t1 = Date.now();
      const candidates = await resumeRepository.searchVector(queryVector, {
        topK,
        minYearsExperience: filters?.minYearsExperience,
      });
      vectorMs = Date.now() - t1;

      return candidates.map((c) => ({
        ...c,
        sources: ['vector' as const],
        score: c.score || c.vectorScore || 0,
        snippet: c.snippet || c.experienceSummary || c.role || (c.skills && c.skills.length > 0 ? c.skills.join(', ') : undefined),
      }));
    })();

    const [bm25, vector] = await Promise.all([bm25Promise, vectorPromise]);
    const totalMs = Date.now() - startTime;

    return {
      mode: 'hybrid-debug',
      query: query.trim(),
      bm25,
      vector,
      timings: {
        bm25Ms,
        embeddingMs,
        vectorMs,
        totalMs,
      },
    };
  }

  async mergedSearch(
    query: string,
    filters?: { minYearsExperience?: number },
    topK = 20
  ): Promise<{
    mode: string;
    query: string;
    totalCandidates: number;
    candidates: Candidate[];
    timings: {
      bm25Ms: number;
      embeddingMs: number;
      vectorMs: number;
      mergeMs: number;
      totalMs: number;
    };
  }> {
    const hybridResult = await this.hybridSearch(query, filters, topK);
    const t0 = Date.now();
    const merged = mergeAndDeduplicateCandidates(hybridResult.bm25, hybridResult.vector);
    const mergeMs = Date.now() - t0;

    return {
      mode: 'merged-deduplicated',
      query: query.trim(),
      totalCandidates: merged.length,
      candidates: merged,
      timings: {
        ...hybridResult.timings,
        mergeMs,
        totalMs: hybridResult.timings.totalMs + mergeMs,
      },
    };
  }

  async endToEndSearch(
    query: string,
    filters?: { minYearsExperience?: number },
    options?: {
      bm25TopK?: number;
      vectorTopK?: number;
      rerankTopN?: number;
      finalTopK?: number;
      summarize?: boolean;
      summaryStyle?: 'short' | 'detailed';
    }
  ): Promise<{
    query: string;
    results: any[];
    degraded: boolean;
    warnings: string[];
    timings: {
      embeddingMs: number;
      bm25Ms: number;
      vectorMs: number;
      rerankMs: number;
      summarizeMs: number;
      totalMs: number;
    };
  }> {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new Error('Search query text is required');
    }

    const startTime = Date.now();
    const warnings: string[] = [];
    let degraded = false;

    const bm25TopK = options?.bm25TopK || 20;
    const vectorTopK = options?.vectorTopK || 20;
    const rerankTopN = options?.rerankTopN || 10;
    const finalTopK = options?.finalTopK || 5;
    const shouldSummarize = options?.summarize ?? false;
    const summaryStyle = options?.summaryStyle || 'short';

    // 1. Run parallel Hybrid Retrieval
    const hybridResult = await this.hybridSearch(query.trim(), filters, Math.max(bm25TopK, vectorTopK));
    const mergedCandidates = mergeAndDeduplicateCandidates(hybridResult.bm25, hybridResult.vector);

    if (mergedCandidates.length === 0) {
      return {
        query: query.trim(),
        results: [],
        degraded: false,
        warnings: ['NO_CANDIDATES_FOUND'],
        timings: {
          embeddingMs: hybridResult.timings.embeddingMs,
          bm25Ms: hybridResult.timings.bm25Ms,
          vectorMs: hybridResult.timings.vectorMs,
          rerankMs: 0,
          summarizeMs: 0,
          totalMs: Date.now() - startTime,
        },
      };
    }

    // Select top candidates to send to LLM re-ranker
    const candidatesToRerank = mergedCandidates.slice(0, rerankTopN);

    // 2. Groq LLM Re-Ranking with Fallback
    let rerankMs = 0;
    let llmRankings: any[] = [];

    const tRerankStart = Date.now();
    try {
      llmRankings = await llmService.rerankCandidates(query.trim(), candidatesToRerank, finalTopK);
      rerankMs = Date.now() - tRerankStart;
    } catch (rerankErr) {
      console.warn('[SearchService] LLM Re-ranking failed, falling back to merged order:', rerankErr);
      degraded = true;
      warnings.push('LLM_RERANK_FAILED');
      rerankMs = Date.now() - tRerankStart;

      // Fallback ranking: use merged candidates directly
      llmRankings = candidatesToRerank.slice(0, finalTopK).map((c, i) => ({
        resumeId: c.id,
        rank: i + 1,
        relevanceScore: c.vectorScore || c.bm25Score || 0.8,
        reason: 'Ranked by retrieval similarity score (LLM re-rank fallback).',
      }));
    }

    // Map candidate details onto LLM ranked results
    const candidateLookup = new Map<string, Candidate>();
    for (const c of mergedCandidates) {
      candidateLookup.set(c.id, c);
    }

    const finalResults: any[] = [];

    for (const rankItem of llmRankings) {
      const candidateObj = candidateLookup.get(rankItem.resumeId);
      if (!candidateObj) continue;

      finalResults.push({
        rank: rankItem.rank,
        resumeId: candidateObj.id,
        name: candidateObj.name || null,
        role: candidateObj.role || null,
        company: candidateObj.company || null,
        totalExperience: candidateObj.totalExperience || 0,
        skills: candidateObj.skills || [],
        sources: candidateObj.sources || [],
        relevanceScore: rankItem.relevanceScore,
        reason: rankItem.reason,
        snippet: candidateObj.snippet,
        summary: null,
      });
    }

    // 3. Optional Candidate Fit Summarization
    let summarizeMs = 0;

    if (shouldSummarize && finalResults.length > 0) {
      const tSummarizeStart = Date.now();
      try {
        await Promise.all(
          finalResults.map(async (item) => {
            const cand = candidateLookup.get(item.resumeId);
            if (cand) {
              item.summary = await llmService.summarizeCandidateFit(query.trim(), cand, {
                style: summaryStyle,
              });
            }
          })
        );
        summarizeMs = Date.now() - tSummarizeStart;
      } catch (sumErr) {
        console.warn('[SearchService] Candidate fit summarization failed:', sumErr);
        degraded = true;
        warnings.push('SUMMARIZATION_FAILED');
        summarizeMs = Date.now() - tSummarizeStart;
      }
    }

    const totalMs = Date.now() - startTime;

    return {
      query: query.trim(),
      results: finalResults,
      degraded,
      warnings,
      timings: {
        embeddingMs: hybridResult.timings.embeddingMs,
        bm25Ms: hybridResult.timings.bm25Ms,
        vectorMs: hybridResult.timings.vectorMs,
        rerankMs,
        summarizeMs,
        totalMs,
      },
    };
  }

  async search(input: SearchQueryInput): Promise<SearchResponse> {
    const candidates = await this.vectorSearch(
      input.query,
      { minYearsExperience: input.minExperience },
      input.topK || 20
    );

    return {
      success: true,
      query: input.query,
      totalCandidates: candidates.length,
      candidates,
    };
  }
}

export const searchService = new SearchService();



