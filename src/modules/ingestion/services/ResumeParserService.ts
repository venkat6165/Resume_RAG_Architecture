import fs from 'fs';
import pdfParse from 'pdf-parse';

export class ResumeParserService {
  async extractTextFromPdf(filePath: string): Promise<string> {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found at path: ${filePath}`);
      }

      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);

      const text = pdfData?.text ? pdfData.text.trim() : '';
      if (!text) {
        throw new Error('Extracted PDF text is empty');
      }

      return text;
    } catch (error: any) {
      console.error('[ResumeParserService] Error extracting text from PDF:', error);
      throw error;
    }
  }
}

export const resumeParserService = new ResumeParserService();
