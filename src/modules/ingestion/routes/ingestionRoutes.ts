import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { RequestWithId } from '../../../middleware/requestId';
import { upload } from '../../../config/multerConfig';
import { ingestionController } from '../controllers/ingestionController';

const router = Router();

// Phase 3 route
router.get('/resume/health', (req, res) => ingestionController.getHealth(req, res));

// Middleware wrapper for multer error handling
const handlePdfUpload = (req: Request, res: Response, next: NextFunction) => {
  upload.single('file')(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(413).json({
            success: false,
            requestId: (req as RequestWithId).id,
            errorCode: 'FILE_TOO_LARGE',
            message: 'Resume exceeds maximum upload size',
          });
          return;
        }
      }
      if (err.errorCode === 'INVALID_FILE_TYPE' || err.statusCode === 415) {
        res.status(415).json({
          success: false,
          requestId: (req as RequestWithId).id,
          errorCode: 'INVALID_FILE_TYPE',
          message: err.message || 'Only PDF files are allowed',
        });
        return;
      }
      return next(err);
    }
    next();
  });
};

// Phase 4 route: Secure PDF Upload
router.post('/resume/upload', handlePdfUpload, (req, res) =>
  ingestionController.uploadResume(req, res)
);

// Phase 5 route: PDF Text Extraction
router.post('/resume/extract', handlePdfUpload, (req, res) =>
  ingestionController.extractText(req, res)
);

// Phase 6 route: Text Cleaning
router.post('/resume/clean', (req, res) =>
  ingestionController.cleanText(req, res)
);

// Phase 8 route: Skills Detection
router.post('/resume/skills', (req, res) =>
  ingestionController.detectSkills(req, res)
);

// Phase 9 route: Algorithm Resume Parser
router.post('/resume/parse', (req, res) =>
  ingestionController.parseResume(req, res)
);

// Phase 10 route: Optional LLM Resume Parser
router.post('/resume/llm-parse', (req, res) =>
  ingestionController.llmParseResume(req, res)
);

// Phase 11 route: Mistral Resume Embedding
router.post('/resume/embed', (req, res) =>
  ingestionController.embedResume(req, res)
);

// Phase 12 route: MongoDB Resume Storage
router.post('/resume/store', (req, res) =>
  ingestionController.storeResume(req, res)
);

// Phase 13 route: Full Resume Ingestion Service
router.post('/resume/ingest', handlePdfUpload, (req, res) =>
  ingestionController.ingestResume(req, res)
);

// Batch Ingestion Route
router.post('/resume/batch-ingest', (req, res) =>
  ingestionController.batchIngest(req, res)
);

export default router;
