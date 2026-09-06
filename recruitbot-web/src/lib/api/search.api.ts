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
        rerankTopN: 10,
        finalTopK: requestedTopK,
        summarize: true,
        summaryStyle: 'short',
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
      }));

      return {
        query: params.query,
        searchType: params.searchType,
        mode: data.mode || params.searchType,
        topK: requestedTopK,
        resultCount: normalizedResults.length,
        duration,
        degraded: data.degraded || false,
        warnings: data.warnings || [],
        results: normalizedResults,
        timings: data.timings,
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
          summary: r.summary,
          sources: r.sources || ['vector'],
          rank: idx + 1,
        })),
      };
    }
  },
};
