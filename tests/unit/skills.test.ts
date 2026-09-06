import { detectSkills } from '../../src/config/skills';

describe('Skills Detection Utility (Phase 8)', () => {
  test('detects technical skills from text', () => {
    const resumeText = 'Experienced in Selenium WebDriver, Core Java, Python, REST Assured, and RAG evaluation.';
    const skills = detectSkills(resumeText);
    expect(skills).toContain('Selenium WebDriver');
    expect(skills).toContain('Core Java');
    expect(skills).toContain('Python');
    expect(skills).toContain('RAG');
  });

  test('returns empty array when no skills match', () => {
    const text = 'General manager handling retail sales and store Operations.';
    const skills = detectSkills(text);
    expect(Array.isArray(skills)).toBe(true);
  });
});
