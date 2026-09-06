import { Request, Response } from 'express';
import { RequestWithId } from '../../../middleware/requestId';
import { retrievalValidationService } from '../services/RetrievalValidationService';
import { resumeRepository } from '../repositories/ResumeRepository';
import { searchService } from '../services/SearchService';
import { llmService } from '../services/LLMService';
import { embeddingService } from '../../../shared/services/EmbeddingService';
import { env } from '../../../config/env';

export class RetrievalController {
  async getHealth(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      status: 'ok',
      module: 'resume-retrieval',
    });
  }

  async getReadiness(_req: Request, res: Response): Promise<void> {
    const result = await retrievalValidationService.checkReadiness();

    if (result.ready) {
      res.status(200).json(result);
    } else {
      res.status(503).json(result);
    }
  }

  async generateEmbedding(req: Request, res: Response): Promise<void> {
    const { input, model } = req.body;

    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      res.status(400).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: 'RAW_TEXT_REQUIRED',
        message: 'Search query input text is required',
      });
      return;
    }

    try {
      const embedding = await embeddingService.generateEmbedding(input.trim());

      res.status(200).json({
        embedding,
        model: model || env.mistralEmbedModel || 'mistral-embed',
        dimension: embedding.length,
      });
    } catch (error: any) {
      console.error('[RetrievalController] Query embedding failed:', error);
      res.status(error?.statusCode || 502).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: error?.errorCode || 'EMBEDDING_FAILED',
        message: error?.message || 'Failed to generate query embedding',
      });
    }
  }

  async getCandidateById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
      const candidate = await resumeRepository.findById(id);

      if (!candidate) {
        res.status(404).json({
          success: false,
          requestId: (req as RequestWithId).id,
          errorCode: 'CANDIDATE_NOT_FOUND',
          message: `Candidate with ID '${id}' not found`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        candidate,
      });
    } catch (error: any) {
      console.error('[RetrievalController] Error fetching candidate:', error);
      res.status(500).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: 'RETRIEVAL_FAILED',
        message: error?.message || 'Failed to fetch candidate',
      });
    }
  }

  async getCandidates(req: Request, res: Response): Promise<void> {
    const limit = parseInt((req.query.limit as string) || '10', 10);

    try {
      const candidates = await resumeRepository.findCandidates(limit);
      res.status(200).json({
        success: true,
        count: candidates.length,
        candidates,
      });
    } catch (error: any) {
      console.error('[RetrievalController] Error fetching candidates:', error);
      res.status(500).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: 'RETRIEVAL_FAILED',
        message: error?.message || 'Failed to fetch candidates',
      });
    }
  }

  async searchBM25(req: Request, res: Response): Promise<void> {
    const { query, topK, filters } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(400).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: 'RAW_TEXT_REQUIRED',
        message: 'Search query string is required',
      });
      return;
    }

    try {
      const candidates = await searchService.bm25Search(query.trim(), filters, topK || 20);

      const formattedResults = candidates.map((c) => ({
        resumeId: c.id,
        name: c.name || null,
        role: c.role || null,
        company: c.company || null,
        totalExperience: c.totalExperience || 0,
        skills: c.skills || [],
        score: c.score || c.bm25Score || 0,
        snippet: c.snippet,
        sources: c.sources || ['bm25'],
      }));

      res.status(200).json({
        mode: 'bm25',
        query,
        count: formattedResults.length,
        results: formattedResults,
      });
    } catch (error: any) {
      console.error('[RetrievalController] BM25 Search error:', error);
      res.status(500).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: 'RETRIEVAL_FAILED',
        message: error?.message || 'BM25 search failed',
      });
    }
  }

  async searchVector(req: Request, res: Response): Promise<void> {
    const { query, topK, filters } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(400).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: 'RAW_TEXT_REQUIRED',
        message: 'Search query text is required',
      });
      return;
    }

    try {
      const candidates = await searchService.vectorSearch(query.trim(), filters, topK || 20);

      const formattedResults = candidates.map((c) => ({
        resumeId: c.id,
        name: c.name || null,
        role: c.role || null,
        company: c.company || null,
        totalExperience: c.totalExperience || 0,
        skills: c.skills || [],
        vectorScore: c.vectorScore || c.score || 0,
        snippet: c.snippet,
        sources: c.sources || ['vector'],
      }));

      res.status(200).json({
        mode: 'vector',
        query: query || undefined,
        count: formattedResults.length,
        results: formattedResults,
      });
    } catch (error: any) {
      console.error('[RetrievalController] Vector Search error:', error);
      res.status(error?.statusCode || 500).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: error?.errorCode || 'RETRIEVAL_FAILED',
        message: error?.message || 'Vector search failed',
      });
    }
  }

  async searchHybrid(req: Request, res: Response): Promise<void> {
    const { query, topK, filters } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(400).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: 'RAW_TEXT_REQUIRED',
        message: 'Search query text is required',
      });
      return;
    }

    try {
      const result = await searchService.hybridSearch(query.trim(), filters, topK || 20);

      const formattedBm25 = result.bm25.map((c) => ({
        resumeId: c.id,
        name: c.name || null,
        role: c.role || null,
        company: c.company || null,
        totalExperience: c.totalExperience || 0,
        skills: c.skills || [],
        score: c.score || c.bm25Score || 0,
        snippet: c.snippet,
        sources: c.sources || ['bm25'],
      }));

      const formattedVector = result.vector.map((c) => ({
        resumeId: c.id,
        name: c.name || null,
        role: c.role || null,
        company: c.company || null,
        totalExperience: c.totalExperience || 0,
        skills: c.skills || [],
        score: c.vectorScore || c.score || 0,
        snippet: c.snippet,
        sources: c.sources || ['vector'],
      }));

      res.status(200).json({
        mode: result.mode,
        query: result.query,
        bm25: formattedBm25,
        vector: formattedVector,
        timings: result.timings,
      });
    } catch (error: any) {
      console.error('[RetrievalController] Hybrid Search error:', error);
      res.status(error?.statusCode || 500).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: error?.errorCode || 'RETRIEVAL_FAILED',
        message: error?.message || 'Hybrid search failed',
      });
    }
  }

  async searchMerged(req: Request, res: Response): Promise<void> {
    const { query, topK, filters } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(400).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: 'RAW_TEXT_REQUIRED',
        message: 'Search query text is required',
      });
      return;
    }

    try {
      const result = await searchService.mergedSearch(query.trim(), filters, topK || 20);

      const formattedCandidates = result.candidates.map((c) => ({
        resumeId: c.id,
        name: c.name || null,
        role: c.role || null,
        company: c.company || null,
        totalExperience: c.totalExperience || 0,
        skills: c.skills || [],
        bm25Score: c.bm25Score || null,
        vectorScore: c.vectorScore || null,
        snippet: c.snippet,
        sources: c.sources || [],
      }));

      res.status(200).json({
        mode: result.mode,
        query: result.query,
        totalCandidates: formattedCandidates.length,
        candidates: formattedCandidates,
        timings: result.timings,
      });
    } catch (error: any) {
      console.error('[RetrievalController] Merged Search error:', error);
      res.status(error?.statusCode || 500).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: error?.errorCode || 'RETRIEVAL_FAILED',
        message: error?.message || 'Merged search failed',
      });
    }
  }

  async rerankCandidates(req: Request, res: Response): Promise<void> {
    const { query, candidates, topK } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(400).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: 'RAW_TEXT_REQUIRED',
        message: 'Search query text is required',
      });
      return;
    }

    if (!Array.isArray(candidates) || candidates.length === 0) {
      res.status(400).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: 'CANDIDATES_REQUIRED',
        message: 'Non-empty candidates array is required for re-ranking',
      });
      return;
    }

    try {
      const normalizedCandidates = candidates.map((c: any) => ({
        id: c.id || c.resumeId || '',
        fileName: c.fileName || 'resume.pdf',
        name: c.name || undefined,
        role: c.role || undefined,
        company: c.company || undefined,
        totalExperience: c.totalExperience ?? undefined,
        skills: Array.isArray(c.skills) ? c.skills : [],
        snippet: c.snippet || c.experienceSummary || '',
      }));

      const results = await llmService.rerankCandidates(query.trim(), normalizedCandidates, topK || 10);

      res.status(200).json({
        mode: 'llm-rerank',
        query: query.trim(),
        totalRanked: results.length,
        results,
        model: env.groqModel || 'groq/compound',
      });
    } catch (error: any) {
      console.error('[RetrievalController] LLM Re-Ranking error:', error);
      res.status(error?.statusCode || 500).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: error?.errorCode || 'RERANKING_FAILED',
        message: error?.message || 'LLM candidate re-ranking failed',
      });
    }
  }

  async summarizeCandidate(req: Request, res: Response): Promise<void> {
    const { query, candidate, style, maxTokens } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(400).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: 'RAW_TEXT_REQUIRED',
        message: 'Search query text is required',
      });
      return;
    }

    if (!candidate || typeof candidate !== 'object') {
      res.status(400).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: 'CANDIDATE_REQUIRED',
        message: 'Candidate object is required for summarization',
      });
      return;
    }

    const candidateId = candidate.resumeId || candidate.id || '';

    try {
      const normalizedCandidate = {
        id: candidateId,
        fileName: candidate.fileName || 'resume.pdf',
        name: candidate.name || undefined,
        role: candidate.role || undefined,
        company: candidate.company || undefined,
        totalExperience: candidate.totalExperience ?? undefined,
        skills: Array.isArray(candidate.skills) ? candidate.skills : [],
        snippet: candidate.snippet || candidate.experienceSummary || '',
      };

      const summary = await llmService.summarizeCandidateFit(query.trim(), normalizedCandidate, {
        style: style === 'detailed' ? 'detailed' : 'short',
        maxTokens: typeof maxTokens === 'number' ? maxTokens : undefined,
      });

      res.status(200).json({
        resumeId: candidateId,
        summary,
      });
    } catch (error: any) {
      console.error('[RetrievalController] Candidate Summarization error:', error);
      res.status(error?.statusCode || 500).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: error?.errorCode || 'SUMMARIZATION_FAILED',
        message: error?.message || 'Candidate summarization failed',
      });
    }
  }

  async searchEndToEnd(req: Request, res: Response): Promise<void> {
    const { query, filters, options } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(400).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: 'INVALID_SEARCH_QUERY',
        message: 'Search query is required',
      });
      return;
    }

    try {
      const result = await searchService.endToEndSearch(query.trim(), filters, options);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('[RetrievalController] End-to-End Search error:', error);
      res.status(error?.statusCode || 500).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: error?.errorCode || 'SEARCH_FAILED',
        message: error?.message || 'End-to-end search failed',
      });
    }
  }
}

export const retrievalController = new RetrievalController();






