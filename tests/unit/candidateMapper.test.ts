import { mapDocToCandidate, extractSkillsFallback } from '../../src/modules/retrieval/utils/candidateMapper';

describe('Candidate Mapper Utility', () => {
  it('should map MongoDB document to Candidate object correctly', () => {
    const doc = {
      _id: '691db80aa895776f97b6eca6',
      fileName: 'Rajesh_Mohan_Kumar.pdf',
      name: 'Rajesh Mohan Kumar',
      role: 'Test Architect',
      company: 'Testleaf Software Solutions',
      totalExperience: 13,
      skills: ['RAG', 'DeepEval', 'Postman'],
      experienceSummary: '13+ years experience in software testing and GenAI QA.',
    };

    const candidate = mapDocToCandidate(doc, 0.95);

    expect(candidate.id).toBe('691db80aa895776f97b6eca6');
    expect(candidate.name).toBe('Rajesh Mohan Kumar');
    expect(candidate.role).toBe('Test Architect');
    expect(candidate.skills).toEqual(['RAG', 'DeepEval', 'Postman']);
    expect(candidate.score).toBe(0.95);
    expect(candidate.snippet).toBe('13+ years experience in software testing and GenAI QA.');
  });

  it('should extract fallback skills and generate snippet if fields are missing', () => {
    const doc = {
      _id: '12345',
      fileName: 'NoSkills.pdf',
      rawText: 'Core Competencies: Python, QA, SQL, Automation testing.\nExperience at Tech Corp.',
    };

    const candidate = mapDocToCandidate(doc);

    expect(candidate.id).toBe('12345');
    expect(candidate.skills.length).toBeGreaterThan(0);
    expect(candidate.skills).toContain('Python');
    expect(candidate.snippet).toBeDefined();
  });
});
