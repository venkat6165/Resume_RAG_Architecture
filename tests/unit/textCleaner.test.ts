import { cleanText } from '../../src/modules/ingestion/utils/textCleaner';

describe('Text Cleaner Utility (Phase 6)', () => {
  test('normalizes extra spaces and newlines', () => {
    const raw = '  Rajesh   Mohan   Kumar \n\n  Test Architect  \n\n\n ';
    const cleaned = cleanText(raw);
    expect(cleaned).toContain('Rajesh Mohan Kumar');
    expect(cleaned).not.toContain('   ');
  });

  test('replaces tabs and bullet points with spaces', () => {
    const raw = 'Skills:\t• Core Java\t• Python\t• RAG';
    const cleaned = cleanText(raw);
    expect(cleaned).toContain('Core Java');
    expect(cleaned).not.toContain('\t');
    expect(cleaned).not.toContain('•');
  });

  test('handles empty or non-string input safely', () => {
    expect(cleanText('')).toBe('');
    expect(cleanText(null as any)).toBe('');
  });
});
