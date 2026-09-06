export type IngestionStep =
  | 'idle'
  | 'uploading'
  | 'processing_pdf'
  | 'parsing_text'
  | 'generating_embeddings'
  | 'storing_mongodb'
  | 'completed'
  | 'failed';

export interface IngestionProgress {
  step: IngestionStep;
  percentage: number;
  message: string;
}

export interface IngestionResult {
  success: boolean;
  resumeId?: string;
  fileName?: string;
  extractedSkillsCount?: number;
  embeddingDimensions?: number;
  storedAt?: string;
  error?: string;
  errorCode?: string;
}
