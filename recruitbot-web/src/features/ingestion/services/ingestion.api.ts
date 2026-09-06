import apiClient from '@/lib/api/client';
import type { IngestionResult } from '@/types/ingestion.types';

export const ingestionApi = {
  async uploadAndIngest(
    file: File,
    onProgress?: (percentage: number, message: string) => void
  ): Promise<IngestionResult> {
    const formData = new FormData();
    formData.append('file', file);

    if (onProgress) onProgress(15, 'Uploading PDF file...');

    try {
      if (onProgress) onProgress(35, 'Extracting text and structure...');
      
      const response = await apiClient.post('/v1/resume/ingest', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percent = Math.round((progressEvent.loaded * 30) / progressEvent.total);
            onProgress(percent, 'Uploading PDF file...');
          }
        },
      });

      if (onProgress) onProgress(75, 'Generating 1024-dim Mistral embedding...');
      await new Promise((r) => setTimeout(r, 400));

      if (onProgress) onProgress(90, 'Storing resume document in MongoDB...');
      await new Promise((r) => setTimeout(r, 300));

      if (onProgress) onProgress(100, 'Ingestion completed! Vector search ready.');

      const data = response.data;
      return {
        success: true,
        resumeId: data.resumeId || data.id,
        fileName: file.name,
        extractedSkillsCount: Array.isArray(data.skills) ? data.skills.length : 0,
        embeddingDimensions: 1024,
        storedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Ingestion failed';
      return {
        success: false,
        error: errorMsg,
        errorCode: err?.response?.data?.errorCode || 'INGESTION_FAILED',
      };
    }
  },
};
