import { Router } from 'express';
import { retrievalController } from '../controllers/retrievalController';

const router = Router();

// Phase 2 route: Retrieval Module Health Check
router.get('/search/health', (req, res) =>
  retrievalController.getHealth(req, res)
);

// Phase 1 route: Retrieval Readiness Check
router.get('/search/readiness', (req, res) =>
  retrievalController.getReadiness(req, res)
);

// Phase 3 route: Shared Query Embedding Endpoint
router.post('/embeddings', (req, res) =>
  retrievalController.generateEmbedding(req, res)
);

// Phase 4 routes: Candidate Lookup & Repository Queries
router.get('/search/candidates', (req, res) =>
  retrievalController.getCandidates(req, res)
);

router.get('/search/candidate/:id', (req, res) =>
  retrievalController.getCandidateById(req, res)
);

// Phase 5 route: Atlas Search / BM25 Endpoint
router.post('/search/bm25', (req, res) =>
  retrievalController.searchBM25(req, res)
);

// Phase 6 route: MongoDB Vector Search Endpoint
router.post('/search/vector', (req, res) =>
  retrievalController.searchVector(req, res)
);

// Phase 8 route: Hybrid Search (Parallel Lexical & Semantic Retrieval)
router.post('/search/hybrid', (req, res) =>
  retrievalController.searchHybrid(req, res)
);

// Phase 9 route: Merge & Deduplicate Candidates Endpoint
router.post('/search/merged', (req, res) =>
  retrievalController.searchMerged(req, res)
);

// Phase 11 route: LLM Candidate Re-Ranking Endpoint
router.post('/search/rerank', (req, res) =>
  retrievalController.rerankCandidates(req, res)
);

// Phase 12 route: Candidate Summarization Endpoint
router.post('/search/summarize', (req, res) =>
  retrievalController.summarizeCandidate(req, res)
);

// Phase 13 & 14 route: Full End-to-End Search Pipeline Endpoint
router.post('/search', (req, res) =>
  retrievalController.searchEndToEnd(req, res)
);

export default router;





