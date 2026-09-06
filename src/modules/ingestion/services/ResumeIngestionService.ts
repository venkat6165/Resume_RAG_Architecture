import fs from 'fs';
import { resumeParserService } from './ResumeParserService';
import { cleanText } from '../utils/textCleaner';
import { detectSkills } from '../../../config/skills';
import { algorithmResumeParser } from './AlgorithmResumeParser';
import { llmResumeParser } from './LLMResumeParser';
import { embeddingService } from './EmbeddingService';
import { resumeIngestionRepository } from '../repositories/ResumeIngestionRepository';
import { env } from '../../../config/env';
import { IngestionResult, ParsedResume } from '../types/ingestion.types';

export class ResumeIngestionService {
  async ingestResume(file: any): Promise<IngestionResult> {
    if (!file || !file.path) {
      const error = new Error('Resume PDF file is required') as any;
      error.errorCode = 'FILE_REQUIRED';
      error.statusCode = 400;
      throw error;
    }

    const totalStart = Date.now();
    let extractMs = 0;
    let cleanMs = 0;
    let parseMs = 0;
    let embeddingMs = 0;
    let mongoInsertMs = 0;

    const filePath = file.path;

    try {
      // 1. Extract Text from PDF
      const extractStart = Date.now();
      const rawText = await resumeParserService.extractTextFromPdf(filePath);
      extractMs = Date.now() - extractStart;

      if (!rawText || rawText.trim().length === 0) {
        const error = new Error('Resume text extraction failed or text is empty') as any;
        error.errorCode = 'RESUME_EXTRACTION_FAILED';
        error.statusCode = 422;
        throw error;
      }

      // 2. Clean Text
      const cleanStart = Date.now();
      const cleanedText = cleanText(rawText);
      cleanMs = Date.now() - cleanStart;

      // 3. Parse Resume & Detect Skills
      const parseStart = Date.now();
      let parsedResume: ParsedResume;

      if (env.useLlmParser && env.groqApiKey) {
        try {
          parsedResume = await llmResumeParser.parseResume(cleanedText);
        } catch (llmErr) {
          console.warn('[ResumeIngestionService] LLM parser failed, falling back to algorithm parser:', llmErr);
          parsedResume = algorithmResumeParser.parseResume(cleanedText);
        }
      } else {
        parsedResume = algorithmResumeParser.parseResume(cleanedText);
      }

      // Merge detected skills from skills dictionary
      const detected = detectSkills(cleanedText);
      const skillSet = new Set<string>([
        ...(parsedResume.skills || []),
        ...detected,
      ]);
      parsedResume.skills = Array.from(skillSet);
      parseMs = Date.now() - parseStart;

      // 4. Generate Embedding
      const embeddingStart = Date.now();
      const textToEmbed = `
${parsedResume.name || ''}
${parsedResume.role || ''}
${parsedResume.skills.join(', ')}
${parsedResume.company || ''}
${parsedResume.experienceSummary || ''}
${cleanedText}
`.trim();

      const embedding = await embeddingService.generateEmbedding(textToEmbed);
      embeddingMs = Date.now() - embeddingStart;

      // 5. Store in MongoDB
      const mongoStart = Date.now();
      const resumeId = await resumeIngestionRepository.storeResumeRecord({
        fileName: file.originalname || 'resume.pdf',
        rawText: cleanedText,
        resume: parsedResume,
        embedding,
        embeddingModel: env.mistralEmbedModel,
        embeddingDimension: embedding.length,
      });
      mongoInsertMs = Date.now() - mongoStart;

      const totalMs = Date.now() - totalStart;

      return {
        success: true,
        message: 'Resume ingestion completed',
        resumeId,
        data: {
          name: parsedResume.name,
          role: parsedResume.role,
          company: parsedResume.company,
          totalExperience: parsedResume.totalExperience,
          skillsCount: parsedResume.skills.length,
          embeddingModel: env.mistralEmbedModel || 'mistral-embed',
          embeddingDimension: embedding.length,
        },
        timings: {
          extractMs,
          cleanMs,
          parseMs,
          embeddingMs,
          mongoInsertMs,
          totalMs,
        },
      };
    } finally {
      // Clean up temporary file only if inside uploads directory or explicitly marked as temp
      const isTempFile = file?.isTemp === true || filePath.includes('uploads');
      if (isTempFile && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkErr) {
          console.error('[ResumeIngestionService] Error unlinking temp file:', unlinkErr);
        }
      }
    }
  }
}

export const resumeIngestionService = new ResumeIngestionService();
