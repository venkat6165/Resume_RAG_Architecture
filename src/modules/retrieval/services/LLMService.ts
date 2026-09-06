import { env } from '../../../config/env';
import { Candidate } from '../types/retrieval.types';

export interface LLMRerankResult {
  resumeId: string;
  rank: number;
  relevanceScore: number;
  reason: string;
}

export function cleanAndParseJSON(rawContent: string): any {
  let cleaned = rawContent.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
  }

  const firstBrace = cleaned.search(/[\{\[]/);
  const lastBrace = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));

  if (firstBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return JSON.parse(cleaned);
}

export class LLMService {
  private get apiKey(): string {
    return env.groqApiKey || '';
  }

  private get model(): string {
    return env.groqModel || 'groq/compound';
  }

  private async callGroqAPI(messages: { role: string; content: string }[], maxTokens = 1000): Promise<string> {
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY is not configured in environment');
    }

    const endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.model,
            messages,
            temperature: 0.1,
            max_tokens: maxTokens,
            response_format: { type: 'json_object' },
          }),
        });

        if (response.status === 429) {
          console.warn(`[LLMService] Rate limited by Groq API (429). Retrying attempt ${attempts}/${maxAttempts}...`);
          await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempts)));
          continue;
        }

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Groq API error (${response.status}): ${errorBody}`);
        }

        const data: any = await response.json();
        const content = data?.choices?.[0]?.message?.content;

        if (!content) {
          throw new Error('Empty response payload received from Groq API');
        }

        return content;
      } catch (err: any) {
        if (attempts >= maxAttempts) {
          throw err;
        }
        console.warn(`[LLMService] Request failed (attempt ${attempts}/${maxAttempts}): ${err.message}. Retrying...`);
        await new Promise((r) => setTimeout(r, 1000 * attempts));
      }
    }

    throw new Error('Failed to complete Groq LLM API request');
  }

  async rerankCandidates(
    query: string,
    candidates: Candidate[],
    topN = 10
  ): Promise<LLMRerankResult[]> {
    if (!query || candidates.length === 0) {
      return [];
    }

    const candidatePromptInput = candidates.slice(0, 20).map((c, index) => ({
      index: index + 1,
      resumeId: c.id,
      name: c.name || 'Candidate',
      role: c.role || 'Not specified',
      company: c.company || 'Not specified',
      totalExperience: c.totalExperience ?? 'Not specified',
      skills: c.skills || [],
      snippet: c.snippet || c.experienceSummary || '',
    }));

    const systemPrompt = `You are an expert technical recruiter & hiring manager. 
Your task is to evaluate and re-rank a set of candidates based on their fit for the recruiter's search query.

CRITICAL CONSTRAINTS:
1. ONLY evaluate and return candidates provided in the input list.
2. DO NOT invent or fabricate any resumeId, name, or candidate.
3. Return a JSON object with key "rankings" containing an array of objects.
4. Each object in "rankings" MUST have keys:
   - "resumeId": string (must match input resumeId exactly)
   - "rank": number (1 for best match, 2 for second best, etc.)
   - "relevanceScore": number (float between 0.00 and 1.00)
   - "reason": string (concise 1-2 sentence justification for candidate fit)
5. Return at most top ${topN} candidates.`;

    const userPrompt = `Recruiter Search Query: "${query}"

Candidates Pool to Re-rank:
${JSON.stringify(candidatePromptInput, null, 2)}`;

    const responseContent = await this.callGroqAPI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    let parsed: any;
    try {
      parsed = cleanAndParseJSON(responseContent);
    } catch (parseErr) {
      console.error('[LLMService] Failed to parse JSON from LLM re-rank response:', responseContent);
      throw new Error('Invalid JSON output from LLM re-ranker');
    }

    const rawRankings = Array.isArray(parsed.rankings) ? parsed.rankings : Array.isArray(parsed.results) ? parsed.results : [];
    const validCandidateIds = new Set(candidates.map((c) => c.id));

    const validatedRankings: LLMRerankResult[] = [];
    let currentRank = 1;

    for (const item of rawRankings) {
      if (item && item.resumeId && validCandidateIds.has(String(item.resumeId))) {
        validatedRankings.push({
          resumeId: String(item.resumeId),
          rank: item.rank || currentRank,
          relevanceScore: typeof item.relevanceScore === 'number' ? Math.min(1.0, Math.max(0.0, item.relevanceScore)) : 0.85,
          reason: item.reason || 'Strong candidate match based on resume profile.',
        });
        currentRank++;
        if (validatedRankings.length >= topN) break;
      }
    }

    return validatedRankings;
  }

  async summarizeCandidateFit(
    query: string,
    candidate: Candidate,
    options: { style?: 'short' | 'detailed'; maxTokens?: number } = {}
  ): Promise<string> {
    const style = options.style || 'short';
    const maxTokens = options.maxTokens || (style === 'short' ? 150 : 300);

    const systemPrompt = `You are a professional HR & Technical Hiring Specialist.
Generate a concise candidate-fit summary evaluating how well the candidate matches the recruiter query.
${style === 'short' ? 'Keep summary to 1-2 impactful sentences (under 60 words).' : 'Provide a structured bullet-point analysis of key strengths and gaps.'}

RULES:
- Base your summary ONLY on the supplied candidate data.
- Do NOT fabricate experience not present in data.
- Return a JSON object with key "summary": string.`;

    const userPrompt = `Recruiter Query: "${query}"
Candidate Profile:
- Name: ${candidate.name || 'Candidate'}
- Role: ${candidate.role || 'N/A'}
- Company: ${candidate.company || 'N/A'}
- Experience: ${candidate.totalExperience ?? 'N/A'} years
- Skills: ${candidate.skills ? candidate.skills.join(', ') : 'N/A'}
- Summary / Snippet: ${candidate.snippet || candidate.experienceSummary || 'N/A'}`;

    const responseContent = await this.callGroqAPI(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      maxTokens
    );

    try {
      const parsed = cleanAndParseJSON(responseContent);
      if (parsed && typeof parsed.summary === 'string') {
        return parsed.summary.trim();
      }
    } catch (_) {}

    return responseContent.trim();
  }

  async extractMetadata(rawText: string): Promise<Record<string, any>> {
    const systemPrompt = `You are a resume metadata extraction AI. Extract key entities from text and return JSON with keys: skills (array), role, domain, totalExperience (number).`;
    const responseContent = await this.callGroqAPI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: rawText.substring(0, 3000) },
    ]);

    try {
      return cleanAndParseJSON(responseContent);
    } catch (_) {
      return { raw: responseContent };
    }
  }
}

export const llmService = new LLMService();
