export interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  company?: string;
  role?: string;
  education?: string;
  totalExperience?: number;
  relevantExperience?: number;
  skills: string[];
  jobTitles?: string[];
  experienceSummary?: string;
}

export interface IngestionTimings {
  extractMs?: number;
  cleanMs?: number;
  parseMs?: number;
  embeddingMs?: number;
  mongoInsertMs?: number;
  totalMs?: number;
}

export interface IngestionResult {
  success: boolean;
  message: string;
  resumeId?: string;
  data?: {
    name?: string;
    role?: string;
    company?: string;
    totalExperience?: number;
    skillsCount: number;
    embeddingModel: string;
    embeddingDimension: number;
  };
  timings?: IngestionTimings;
}
