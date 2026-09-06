import { cleanAndParseJSON } from '../../src/modules/retrieval/services/LLMService';

describe('LLM Service Utilities', () => {
  it('should parse clean JSON correctly', () => {
    const jsonStr = '{"rankings": [{"resumeId": "123", "rank": 1}]}';
    const result = cleanAndParseJSON(jsonStr);
    expect(result.rankings).toHaveLength(1);
    expect(result.rankings[0].resumeId).toBe('123');
  });

  it('should clean markdown block markers around JSON output', () => {
    const rawStr = '```json\n{"rankings": [{"resumeId": "abc", "rank": 1}]}\n```';
    const result = cleanAndParseJSON(rawStr);
    expect(result.rankings[0].resumeId).toBe('abc');
  });

  it('should extract JSON embedded within commentary text', () => {
    const rawStr = 'Here is the response:\n```json\n{"summary": "Great fit"}\n```\nHope this helps!';
    const result = cleanAndParseJSON(rawStr);
    expect(result.summary).toBe('Great fit');
  });
});
