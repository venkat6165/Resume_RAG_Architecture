import { getDb } from '../../../config/database';
import { env } from '../../../config/env';
import { ParsedResume } from '../types/ingestion.types';

export interface StoreResumeInput {
  fileName: string;
  rawText: string;
  resume: ParsedResume;
  embedding: number[];
  embeddingModel?: string;
  embeddingDimension?: number;
}

export class ResumeIngestionRepository {
  private get collectionName(): string {
    return env.collectionName || 'Resume_Collection';
  }

  async storeResumeRecord(input: StoreResumeInput): Promise<string> {
    const db = getDb();
    const now = new Date();

    const document = {
      fileName: input.fileName || 'resume.pdf',
      rawText: input.rawText || '',
      name: input.resume.name || null,
      email: input.resume.email || null,
      phone: input.resume.phone || null,
      location: input.resume.location || null,
      company: input.resume.company || null,
      role: input.resume.role || null,
      education: input.resume.education || null,
      totalExperience: input.resume.totalExperience ?? null,
      relevantExperience: input.resume.relevantExperience ?? null,
      skills: Array.isArray(input.resume.skills) ? input.resume.skills : [],
      jobTitles: Array.isArray(input.resume.jobTitles) ? input.resume.jobTitles : [],
      experienceSummary: input.resume.experienceSummary || null,
      embedding: Array.isArray(input.embedding) ? input.embedding : [],
      embeddingModel: input.embeddingModel || env.mistralEmbedModel || 'mistral-embed',
      embeddingDimension: input.embeddingDimension || input.embedding?.length || env.embeddingDimension || 1024,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection(this.collectionName).insertOne(document);
    return result.insertedId.toString();
  }

  async existsByFileName(fileName: string): Promise<boolean> {
    const db = getDb();
    const count = await db.collection(this.collectionName).countDocuments({ fileName }, { limit: 1 });
    return count > 0;
  }

  async getExistingFileNames(): Promise<Set<string>> {
    const db = getDb();
    const records = await db.collection(this.collectionName).find({}, { projection: { fileName: 1 } }).toArray();
    return new Set(records.map((r) => r.fileName).filter(Boolean));
  }
}

export const resumeIngestionRepository = new ResumeIngestionRepository();
