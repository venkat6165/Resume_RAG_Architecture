import { env } from '../../../config/env';
import { ParsedResume } from '../types/ingestion.types';
import { algorithmResumeParser } from './AlgorithmResumeParser';

export class LLMResumeParser {
  async parseResume(rawText: string): Promise<ParsedResume> {
    if (!env.useLlmParser) {
      const error = new Error('LLM resume parser is disabled') as any;
      error.errorCode = 'LLM_PARSER_DISABLED';
      error.statusCode = 400;
      throw error;
    }

    if (!env.groqApiKey) {
      console.warn('[LLMResumeParser] GROQ_API_KEY is missing, falling back to algorithm parser');
      return algorithmResumeParser.parseResume(rawText);
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: env.groqModel || 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [
            {
              role: 'system',
              content: 'You are an expert resume parser. Extract structured fields from the resume text and return STRICT JSON with keys: name, email, phone, role, company, education, totalExperience (number), skills (string array), jobTitles (string array). Do not hallucinate missing info.',
            },
            {
              role: 'user',
              content: rawText,
            },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API returned error status: ${response.status}`);
      }

      const data: any = await response.json();
      const content = data?.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('Empty response from LLM parser');
      }

      const parsed: ParsedResume = JSON.parse(content);
      return {
        ...parsed,
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      };
    } catch (err) {
      console.error('[LLMResumeParser] Failed to parse with LLM, fallback to algorithm parser:', err);
      return algorithmResumeParser.parseResume(rawText);
    }
  }
}

export const llmResumeParser = new LLMResumeParser();
