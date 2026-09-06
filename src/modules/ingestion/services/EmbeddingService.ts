import { env } from '../../../config/env';

export class EmbeddingService {
  async generateEmbedding(text: string, retries = 3): Promise<number[]> {
    if (!text || typeof text !== 'string') {
      throw new Error('Text input for embedding cannot be empty');
    }

    if (!env.mistralApiKey) {
      const error = new Error('Mistral API Key is not configured in .env') as any;
      error.errorCode = 'EMBEDDING_FAILED';
      error.statusCode = 502;
      throw error;
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch('https://api.mistral.ai/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.mistralApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: env.mistralEmbedModel || 'mistral-embed',
            input: [text],
          }),
        });

        if (response.status === 429 && attempt < retries) {
          const delayMs = attempt * 2000;
          console.warn(`[EmbeddingService] Mistral API 429 Rate Limited. Waiting ${delayMs}ms before retry (${attempt}/${retries})...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        if (!response.ok) {
          const errText = await response.text();
          console.error('[EmbeddingService] Mistral API error response:', response.status, errText);
          const error = new Error(`Mistral API error: ${response.statusText}`) as any;
          error.errorCode = 'EMBEDDING_FAILED';
          error.statusCode = 502;
          throw error;
        }

        const data: any = await response.json();
        const embedding = data?.data?.[0]?.embedding;

        if (!Array.isArray(embedding) || embedding.length === 0) {
          const error = new Error('Invalid embedding vector returned from Mistral API') as any;
          error.errorCode = 'EMBEDDING_FAILED';
          error.statusCode = 502;
          throw error;
        }

        return embedding;
      } catch (error: any) {
        if (attempt === retries) {
          console.error('[EmbeddingService] Failed to generate embedding after max retries:', error);
          if (!error.errorCode) {
            error.errorCode = 'EMBEDDING_FAILED';
            error.statusCode = 502;
          }
          throw error;
        }
      }
    }

    throw new Error('Failed to generate embedding');
  }
}

export const embeddingService = new EmbeddingService();
