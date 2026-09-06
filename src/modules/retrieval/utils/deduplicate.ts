import { Candidate } from '../types/retrieval.types';

export function mergeAndDeduplicateCandidates(
  bm25Candidates: Candidate[],
  vectorCandidates: Candidate[]
): Candidate[] {
  const candidateMap = new Map<string, Candidate>();

  // Process BM25 candidates
  for (const candidate of bm25Candidates) {
    const key = candidate.id;
    if (!key) continue;

    candidateMap.set(key, {
      ...candidate,
      sources: Array.from(new Set([...(candidate.sources || []), 'bm25'])),
      bm25Score: candidate.bm25Score || candidate.score,
    });
  }

  // Process Vector candidates and merge with BM25 candidates
  for (const candidate of vectorCandidates) {
    const key = candidate.id;
    if (!key) continue;

    const existing = candidateMap.get(key);

    if (existing) {
      const combinedSources = Array.from(
        new Set([...(existing.sources || []), ...(candidate.sources || []), 'vector'])
      );

      candidateMap.set(key, {
        ...existing,
        ...candidate,
        name: candidate.name || existing.name,
        role: candidate.role || existing.role,
        company: candidate.company || existing.company,
        skills: candidate.skills && candidate.skills.length > 0 ? candidate.skills : existing.skills,
        totalExperience: candidate.totalExperience ?? existing.totalExperience,
        snippet: existing.snippet || candidate.snippet,
        bm25Score: existing.bm25Score || existing.score,
        vectorScore: candidate.vectorScore || candidate.score,
        sources: combinedSources as ('bm25' | 'vector')[],
      });
    } else {
      candidateMap.set(key, {
        ...candidate,
        sources: Array.from(new Set([...(candidate.sources || []), 'vector'])),
        vectorScore: candidate.vectorScore || candidate.score,
      });
    }
  }

  return Array.from(candidateMap.values());
}
