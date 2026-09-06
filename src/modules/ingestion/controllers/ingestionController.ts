import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { RequestWithId } from '../../../middleware/requestId';
import { resumeParserService } from '../services/ResumeParserService';
import { cleanText } from '../utils/textCleaner';
import { detectSkills } from '../../../config/skills';
import { algorithmResumeParser } from '../services/AlgorithmResumeParser';
import { llmResumeParser } from '../services/LLMResumeParser';
import { embeddingService } from '../services/EmbeddingService';
import { resumeIngestionRepository } from '../repositories/ResumeIngestionRepository';
import { resumeIngestionService } from '../services/ResumeIngestionService';
import { batchIngestionService } from '../services/BatchIngestionService';
import { env } from '../../../config/env';

export class IngestionController {
  async getHealth(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      status: 'ok',
      module: 'resume-ingestion',
    });
  }

  async uploadResume(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      res.status(400).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: 'FILE_REQUIRED',
        message: 'Resume PDF is required',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      file: {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
    });
  }

  async extractText(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      res.status(400).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: 'FILE_REQUIRED',
        message: 'Resume PDF is required',
      });
      return;
    }

    const filePath = req.file.path;

    try {
      const rawText = await resumeParserService.extractTextFromPdf(filePath);

      res.status(200).json({
        success: true,
        rawText,
        characters: rawText.length,
      });
    } catch (error: any) {
      console.error('[IngestionController] Extraction error:', error);
      res.status(422).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: 'RESUME_EXTRACTION_FAILED',
        message: 'Resume extraction failed',
      });
    } finally {
      // Clean up temporary file
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkErr) {
          console.error('[IngestionController] Error deleting temp file:', unlinkErr);
        }
      }
    }
  }

  async cleanText(req: Request, res: Response): Promise<void> {
    const { rawText } = req.body;

    if (rawText === undefined || typeof rawText !== 'string') {
      res.status(400).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: 'RAW_TEXT_REQUIRED',
        message: 'rawText string is required',
      });
      return;
    }

    const cleaned = cleanText(rawText);

    res.status(200).json({
      success: true,
      cleanText: cleaned,
    });
  }

  async detectSkills(req: Request, res: Response): Promise<void> {
    const { rawText } = req.body;

    if (rawText === undefined || typeof rawText !== 'string') {
      res.status(400).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: 'RAW_TEXT_REQUIRED',
        message: 'rawText string is required',
      });
      return;
    }

    const skills = detectSkills(rawText);

    res.status(200).json({
      success: true,
      skills,
    });
  }

  async parseResume(req: Request, res: Response): Promise<void> {
    const { rawText } = req.body;

    if (rawText === undefined || typeof rawText !== 'string') {
      res.status(400).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: 'RAW_TEXT_REQUIRED',
        message: 'rawText string is required',
      });
      return;
    }

    try {
      const parsed = algorithmResumeParser.parseResume(rawText);

      res.status(200).json({
        success: true,
        resume: parsed,
      });
    } catch (error) {
      res.status(422).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: 'RESUME_PARSE_FAILED',
        message: 'Resume parsing failed',
      });
    }
  }

  async llmParseResume(req: Request, res: Response): Promise<void> {
    const { rawText } = req.body;

    if (rawText === undefined || typeof rawText !== 'string') {
      res.status(400).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: 'RAW_TEXT_REQUIRED',
        message: 'rawText string is required',
      });
      return;
    }

    if (!env.useLlmParser) {
      res.status(400).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: 'LLM_PARSER_DISABLED',
        message: 'LLM resume parser is disabled',
      });
      return;
    }

    try {
      const parsed = await llmResumeParser.parseResume(rawText);

      res.status(200).json({
        success: true,
        resume: parsed,
      });
    } catch (error: any) {
      res.status(error?.statusCode || 422).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: error?.errorCode || 'LLM_PARSE_FAILED',
        message: error?.message || 'LLM resume parsing failed',
      });
    }
  }

  async embedResume(req: Request, res: Response): Promise<void> {
    const { name, role, skills, company, experienceSummary, rawText } = req.body;

    const embeddingText = `
${name || ''}
${role || ''}
${Array.isArray(skills) ? skills.join(', ') : ''}
${company || ''}
${experienceSummary || ''}
${rawText || ''}
`.trim();

    if (!embeddingText) {
      res.status(400).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: 'RAW_TEXT_REQUIRED',
        message: 'Resume text or metadata is required to generate embedding',
      });
      return;
    }

    try {
      const embedding = await embeddingService.generateEmbedding(embeddingText);

      res.status(200).json({
        success: true,
        model: env.mistralEmbedModel,
        dimension: embedding.length,
        embedding,
      });
    } catch (error: any) {
      res.status(error?.statusCode || 502).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: error?.errorCode || 'EMBEDDING_FAILED',
        message: error?.message || 'Mistral embedding failed',
      });
    }
  }

  async storeResume(req: Request, res: Response): Promise<void> {
    const { fileName, resume, rawText, embedding } = req.body;

    if (!rawText || !embedding) {
      res.status(400).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: 'INVALID_INPUT',
        message: 'rawText and embedding are required to store resume',
      });
      return;
    }

    try {
      const resumeId = await resumeIngestionRepository.storeResumeRecord({
        fileName: fileName || 'resume.pdf',
        rawText,
        resume: resume || { skills: [] },
        embedding,
        embeddingModel: env.mistralEmbedModel,
        embeddingDimension: embedding.length,
      });

      res.status(200).json({
        success: true,
        message: 'Resume stored successfully',
        resumeId,
      });
    } catch (error: any) {
      console.error('[IngestionController] Failed to store resume in MongoDB:', error);
      res.status(500).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: 'INGESTION_FAILED',
        message: 'Resume ingestion failed',
      });
    }
  }

  async ingestResume(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      res.status(400).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: 'FILE_REQUIRED',
        message: 'Resume PDF is required',
      });
      return;
    }

    try {
      const result = await resumeIngestionService.ingestResume(req.file);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('[IngestionController] Full ingestion error:', error);
      res.status(error?.statusCode || 500).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: error?.errorCode || 'INGESTION_FAILED',
        message: error?.message || 'Resume ingestion failed',
      });
    }
  }

  async batchIngest(req: Request, res: Response): Promise<void> {
    const targetDir = req.body?.dirPath
      ? path.resolve(req.body.dirPath)
      : path.resolve(__dirname, '../../../../Resumes');

    const force = req.body?.force === true;

    try {
      const summary = await batchIngestionService.ingestDirectory(targetDir, { force });
      res.status(200).json({
        success: true,
        message: 'Batch resume ingestion completed',
        summary,
      });
    } catch (error: any) {
      console.error('[IngestionController] Batch ingestion error:', error);
      res.status(500).json({
        success: false,
        requestId: (req as RequestWithId).id,
        errorCode: 'BATCH_INGESTION_FAILED',
        message: error?.message || 'Batch resume ingestion failed',
      });
    }
  }
}

export const ingestionController = new IngestionController();
