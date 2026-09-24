import apiClient from './client';
import type { SearchRequest, SearchResponse } from '@/types/search.types';

export const searchApi = {
  async searchResumes(params: SearchRequest): Promise<SearchResponse> {
    const startTime = Date.now();
    const requestedTopK = params.topK || 5;

    // Map frontend request payload to backend endpoints (supporting both top-level topK and nested options.finalTopK)
    const payload = {
      query: params.query.trim(),
      topK: requestedTopK,
      filters: params.filters || {},
      options: {
        bm25TopK: requestedTopK,
        vectorTopK: requestedTopK,
        rerankTopN: params.options?.enableRerank !== false ? (params.options?.rerankTopN || 10) : 0,
        finalTopK: requestedTopK,
        summarize: params.options?.summarize !== false,
        summaryStyle: params.options?.summaryStyle || 'short',
        bm25Weight: params.bm25Weight,
        vectorWeight: params.vectorWeight,
      },
    };

    // Determine target endpoint based on search mode
    let endpoint = '/v1/search';
    if (params.searchType === 'keyword') {
      endpoint = '/v1/search/bm25';
    } else if (params.searchType === 'vector') {
      endpoint = '/v1/search/vector';
    } else if (params.searchType === 'hybrid') {
      endpoint = '/v1/search';
    }

    try {
      const response = await apiClient.post(endpoint, payload);
      const data = response.data;
      const duration = data.timings?.totalMs || (Date.now() - startTime);

      // Extract raw candidates array handling all endpoint formats (/v1/search, /v1/search/hybrid, /v1/search/merged)
      let rawResults: any[] = [];
      if (Array.isArray(data.results)) {
        rawResults = data.results;
      } else if (Array.isArray(data.candidates)) {
        rawResults = data.candidates;
      } else if (Array.isArray(data.bm25) || Array.isArray(data.vector)) {
        const mergedMap = new Map<string, any>();
        (data.bm25 || []).forEach((item: any) => {
          const key = item.resumeId || item.id || item._id;
          if (key) mergedMap.set(key, { ...item, sources: ['bm25'] });
        });
        (data.vector || []).forEach((item: any) => {
          const key = item.resumeId || item.id || item._id;
          if (key) {
            const existing = mergedMap.get(key);
            if (existing) {
              mergedMap.set(key, { ...existing, ...item, sources: ['bm25', 'vector'] });
            } else {
              mergedMap.set(key, { ...item, sources: ['vector'] });
            }
          }
        });
        rawResults = Array.from(mergedMap.values());
      }

      // If endpoint is vector or bm25, but LLM Re-ranking toggle is ON, perform LLM Re-ranking & Summarization
      const shouldRerank = params.options?.enableRerank !== false;
      let rerankMs = 0;
      let summarizeMs = 0;

      if ((params.searchType === 'keyword' || params.searchType === 'vector') && shouldRerank && rawResults.length > 0) {
        const rerankStartTime = Date.now();
        try {
          const rerankPayload = {
            query: params.query.trim(),
            candidates: rawResults.slice(0, 10).map((r: any) => ({
              id: r.resumeId || r.id || r._id,
              fileName: r.fileName || 'resume.pdf',
              name: r.name || 'Candidate',
              role: r.role || r.title,
              company: r.company,
              totalExperience: r.totalExperience ?? r.experienceYears ?? 0,
              skills: Array.isArray(r.skills) ? r.skills : [],
              snippet: r.snippet || r.experienceSummary || '',
            })),
            topK: requestedTopK,
          };

          const rerankResponse = await apiClient.post('/v1/search/rerank', rerankPayload);
          rerankMs = Date.now() - rerankStartTime;
          const rerankData = rerankResponse.data;

          if (Array.isArray(rerankData.results) && rerankData.results.length > 0) {
            const rerankMap = new Map<string, any>();
            rerankData.results.forEach((item: any) => {
              if (item.resumeId) rerankMap.set(String(item.resumeId), item);
            });

            const rerankedList: any[] = [];
            for (const item of rerankData.results) {
              const match = rawResults.find(
                (r) => String(r.resumeId || r.id || r._id) === String(item.resumeId)
              );
              if (match) {
                rerankedList.push({
                  ...match,
                  rank: item.rank,
                  relevanceScore: item.relevanceScore,
                  reason: item.reason,
                });
              }
            }

            for (const r of rawResults) {
              const idStr = String(r.resumeId || r.id || r._id);
              if (!rerankMap.has(idStr)) {
                rerankedList.push(r);
              }
            }

            rawResults = rerankedList;
          }
        } catch (rerankErr) {
          console.warn('[searchApi] LLM Re-ranking call failed:', rerankErr);
        }

        // Generate Candidate Fit Summary for ALL re-ranked candidates if requested
        const candidatesToSummarize = rawResults.slice(0, requestedTopK);
        if (candidatesToSummarize.length > 0) {
          const sumStartTime = Date.now();
          try {
            await Promise.all(
              candidatesToSummarize.map(async (cand) => {
                try {
                  const sumRes = await apiClient.post('/v1/search/summarize', {
                    query: params.query.trim(),
                    candidate: {
                      id: cand.resumeId || cand.id || cand._id,
                      name: cand.name,
                      role: cand.role,
                      company: cand.company,
                      totalExperience: cand.totalExperience ?? cand.experienceYears ?? 0,
                      skills: cand.skills || [],
                      snippet: cand.snippet || cand.experienceSummary || '',
                    },
                    style: params.options?.summaryStyle || 'short',
                  });
                  if (sumRes.data?.summary) {
                    cand.summary = sumRes.data.summary;
                  }
                } catch (singleErr) {
                  console.warn('[searchApi] Candidate summary failed:', singleErr);
                }
              })
            );
            summarizeMs = Date.now() - sumStartTime;
          } catch (sumErr) {
            console.warn('[searchApi] Summarization batch failed:', sumErr);
          }
        }
      }

      // Enforce strict topK result limit slicing
      const slicedRawResults = rawResults.slice(0, requestedTopK);

      const normalizedResults = slicedRawResults.map((r: any, idx: number) => ({
        candidateId: r.resumeId || r.id || r._id || `cand-${idx}`,
        resumeId: r.resumeId || r.id || r._id,
        name: r.name || 'Candidate',
        email: r.email,
        phone: r.phone || r.phoneNumber,
        role: r.role || r.title,
        company: r.company,
        score: typeof r.relevanceScore === 'number' ? r.relevanceScore : (r.score || r.vectorScore || r.bm25Score || 0.85),
        relevanceScore: r.relevanceScore,
        bm25Score: r.bm25Score,
        vectorScore: r.vectorScore,
        experienceYears: r.totalExperience ?? r.experienceYears ?? 0,
        skills: Array.isArray(r.skills) ? r.skills : [],
        snippet: r.snippet || r.experienceSummary || '',
        summary: r.summary,
        sources: Array.isArray(r.sources) ? r.sources : [params.searchType === 'keyword' ? 'bm25' : 'vector'],
        reason: r.reason,
        rank: r.rank || idx + 1,
        isDeduplicated: Array.isArray(r.sources) && r.sources.length > 1,
      }));

      const deduplicatedCount = normalizedResults.filter((r) => r.isDeduplicated).length;

      return {
        query: params.query,
        searchType: params.searchType,
        mode: data.mode || params.searchType,
        topK: requestedTopK,
        resultCount: normalizedResults.length,
        deduplicatedCount,
        duration,
        degraded: data.degraded || false,
        results: normalizedResults,
        timings: {
          ...data.timings,
          rerankMs: rerankMs || data.timings?.rerankMs,
          summarizeMs: summarizeMs || data.timings?.summarizeMs,
          totalMs: Date.now() - startTime,
        },
      };
    } catch (err: any) {
      console.warn('[searchApi] Mode endpoint failed, falling back to /v1/search:', err);
      const fallbackResponse = await apiClient.post('/v1/search', {
        query: params.query.trim(),
        options: { finalTopK: requestedTopK, summarize: true },
      });
      const data = fallbackResponse.data;
      const duration = Date.now() - startTime;
      const rawResults = Array.isArray(data.results) ? data.results.slice(0, requestedTopK) : [];

      return {
        query: params.query,
        searchType: params.searchType,
        topK: requestedTopK,
        resultCount: rawResults.length,
        duration,
        results: rawResults.map((r: any, idx: number) => ({
          candidateId: r.resumeId || r.id || `cand-${idx}`,
          name: r.name || 'Candidate',
          role: r.role,
          company: r.company,
          score: r.relevanceScore || 0.85,
          experienceYears: r.totalExperience || 0,
          skills: r.skills || [],
          snippet: r.snippet || '',
          sources: r.sources || ['vector'],
          rank: idx + 1,
        })),
      };
    }
  },

  async summarizeCandidate(
    query: string,
    candidate: any,
    style: 'short' | 'detailed' = 'short'
  ): Promise<string> {
    try {
      const response = await apiClient.post('/v1/search/summarize', {
        query: query.trim(),
        candidate: {
          id: candidate.candidateId || candidate.resumeId || candidate.id,
          fileName: candidate.fileName || 'resume.pdf',
          name: candidate.name || 'Candidate',
          role: candidate.role,
          company: candidate.company,
          totalExperience: candidate.experienceYears ?? candidate.totalExperience ?? 0,
          skills: candidate.skills || [],
          snippet: candidate.snippet || '',
        },
        style,
      });

      return response.data?.summary || 'Candidate fit summary unavailable.';
    } catch (err: any) {
      console.warn('[searchApi] Single candidate summarization failed:', err);
      throw err;
    }
  },
};
