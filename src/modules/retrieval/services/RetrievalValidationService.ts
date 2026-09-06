import { getDb } from '../../../config/database';
import { env } from '../../../config/env';

export interface RetrievalReadinessResult {
  ready: boolean;
  collection?: string;
  resumeCount?: number;
  resumesWithEmbedding?: number;
  embeddingModel?: string;
  embeddingDimension?: number;
  reason?: string;
}

export class RetrievalValidationService {
  private get collectionName(): string {
    return env.collectionName || 'Resume_Collection';
  }

  async checkReadiness(): Promise<RetrievalReadinessResult> {
    try {
      const db = getDb();
      const collection = db.collection(this.collectionName);

      const resumeCount = await collection.countDocuments();
      const resumesWithEmbedding = await collection.countDocuments({
        embedding: { $exists: true, $type: 'array', $ne: [] },
      });

      if (resumeCount === 0 || resumesWithEmbedding === 0) {
        return {
          ready: false,
          reason: 'No ingested resume embeddings are available',
        };
      }

      // Sample document to verify embedding dimensions
      const sampleDoc =
        (await collection.findOne({ embeddingDimension: 1024 })) ||
        (await collection.findOne({
          embedding: { $exists: true, $type: 'array', $ne: [] },
        }));

      const sampleEmbedding = sampleDoc?.embedding || [];

      return {
        ready: true,
        collection: this.collectionName,
        resumeCount,
        resumesWithEmbedding,
        embeddingModel: sampleDoc?.embeddingModel || env.mistralEmbedModel || 'mistral-embed',
        embeddingDimension: sampleEmbedding.length || env.embeddingDimension || 1024,
      };
    } catch (error: any) {
      console.error('[RetrievalValidationService] Readiness check failed:', error);
      return {
        ready: false,
        reason: error?.message || 'Database readiness check failed',
      };
    }
  }
}

export const retrievalValidationService = new RetrievalValidationService();
