import { mergeAndDeduplicateCandidates } from '../../src/modules/retrieval/utils/deduplicate';
import { Candidate } from '../../src/modules/retrieval/types/retrieval.types';

describe('Candidate Deduplication Utility', () => {
  it('should merge BM25 and Vector candidates by ID and preserve provenance', () => {
    const bm25Candidates: Candidate[] = [
      { id: '1', fileName: 'c1.pdf', name: 'Alice', skills: [], bm25Score: 10, sources: ['bm25'] },
      { id: '2', fileName: 'c2.pdf', name: 'Bob', skills: [], bm25Score: 8, sources: ['bm25'] },
    ];

    const vectorCandidates: Candidate[] = [
      { id: '2', fileName: 'c2.pdf', name: 'Bob', skills: [], vectorScore: 0.92, sources: ['vector'] },
      { id: '3', fileName: 'c3.pdf', name: 'Charlie', skills: [], vectorScore: 0.88, sources: ['vector'] },
    ];

    const merged = mergeAndDeduplicateCandidates(bm25Candidates, vectorCandidates);

    expect(merged.length).toBe(3);

    const alice = merged.find((c) => c.id === '1');
    expect(alice?.sources).toEqual(['bm25']);

    const bob = merged.find((c) => c.id === '2');
    expect(bob?.sources ? [...bob.sources].sort() : []).toEqual(['bm25', 'vector'].sort());
    expect(bob?.bm25Score).toBe(8);
    expect(bob?.vectorScore).toBe(0.92);

    const charlie = merged.find((c) => c.id === '3');
    expect(charlie?.sources).toEqual(['vector']);
  });

  it('should handle empty input arrays gracefully', () => {
    const merged = mergeAndDeduplicateCandidates([], []);
    expect(merged).toEqual([]);
  });
});
