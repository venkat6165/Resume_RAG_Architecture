import { algorithmResumeParser } from '../../src/modules/ingestion/services/AlgorithmResumeParser';

describe('Algorithm Resume Parser (Phase 9)', () => {
  test('parses resume contact info, experience, and skills', () => {
    const rawText = `
Rajesh Mohan Kumar
Test Architect & Senior Agentic Test Engineer
Email: rajesh.kumar@example.com
Phone: +91 9876543210
Location: Chennai, India
Company: Testleaf Software Solutions Private Limited
Education: B.Tech - Information Technology
Total Experience: 13+ years of experience in QA architecture.
Skills: Selenium WebDriver, Core Java, Python, RAG, DeepEval, MCP.
    `;

    const parsed = algorithmResumeParser.parseResume(rawText);

    expect(parsed.name).toBe('Rajesh Mohan Kumar');
    expect(parsed.email).toBe('rajesh.kumar@example.com');
    expect(parsed.phone).toBe('+91 9876543210');
    expect(parsed.totalExperience).toBe(13);
    expect(parsed.skills).toContain('RAG');
    expect(parsed.skills).toContain('Python');
  });
});
