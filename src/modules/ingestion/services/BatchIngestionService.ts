import fs from 'fs';
import path from 'path';
import { resumeIngestionService } from './ResumeIngestionService';
import { resumeIngestionRepository } from '../repositories/ResumeIngestionRepository';

export interface BatchIngestionOptions {
  force?: boolean;
  throttleMs?: number;
  onProgress?: (progress: {
    current: number;
    total: number;
    fileName: string;
    status: 'INSERTED' | 'SKIPPED' | 'FAILED';
    resumeId?: string;
    error?: string;
  }) => void;
}

export interface BatchIngestionSummary {
  totalFilesFound: number;
  pdfFilesCount: number;
  processedCount: number;
  insertedCount: number;
  skippedCount: number;
  failedCount: number;
  failedFiles: Array<{ fileName: string; error: string }>;
  durationMs: number;
}

export class BatchIngestionService {
  async ingestDirectory(
    dirPath: string,
    options: BatchIngestionOptions = {}
  ): Promise<BatchIngestionSummary> {
    const startTime = Date.now();
    const throttleMs = options.throttleMs ?? 500;

    if (!fs.existsSync(dirPath)) {
      throw new Error(`Target directory does not exist: ${dirPath}`);
    }

    const allFiles = fs.readdirSync(dirPath);
    const pdfFiles = allFiles.filter((f) => f.toLowerCase().endsWith('.pdf'));

    const existingNames = options.force
      ? new Set<string>()
      : await resumeIngestionRepository.getExistingFileNames();

    let insertedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;
    const failedFiles: Array<{ fileName: string; error: string }> = [];

    for (let i = 0; i < pdfFiles.length; i++) {
      const fileName = pdfFiles[i];
      const filePath = path.join(dirPath, fileName);

      if (!options.force && existingNames.has(fileName)) {
        skippedCount++;
        if (options.onProgress) {
          options.onProgress({
            current: i + 1,
            total: pdfFiles.length,
            fileName,
            status: 'SKIPPED',
          });
        }
        continue;
      }

      try {
        const fileObj = {
          path: filePath,
          originalname: fileName,
        };

        const result = await resumeIngestionService.ingestResume(fileObj);

        if (result.success && result.resumeId) {
          insertedCount++;
          existingNames.add(fileName);
          if (options.onProgress) {
            options.onProgress({
              current: i + 1,
              total: pdfFiles.length,
              fileName,
              status: 'INSERTED',
              resumeId: result.resumeId,
            });
          }
        } else {
          failedCount++;
          failedFiles.push({ fileName, error: result.message || 'Unknown ingestion error' });
          if (options.onProgress) {
            options.onProgress({
              current: i + 1,
              total: pdfFiles.length,
              fileName,
              status: 'FAILED',
              error: result.message,
            });
          }
        }
      } catch (err: any) {
        failedCount++;
        const errMsg = err?.message || 'Ingestion failure';
        failedFiles.push({ fileName, error: errMsg });
        if (options.onProgress) {
          options.onProgress({
            current: i + 1,
            total: pdfFiles.length,
            fileName,
            status: 'FAILED',
            error: errMsg,
          });
        }
      }

      // Throttle between API calls
      if (throttleMs > 0 && i < pdfFiles.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, throttleMs));
      }
    }

    const durationMs = Date.now() - startTime;

    return {
      totalFilesFound: allFiles.length,
      pdfFilesCount: pdfFiles.length,
      processedCount: pdfFiles.length,
      insertedCount,
      skippedCount,
      failedCount,
      failedFiles,
      durationMs,
    };
  }
}

export const batchIngestionService = new BatchIngestionService();
