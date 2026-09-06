export interface ExperienceItem {
  company: string;
  title: string;
  duration?: string;
  description?: string;
}

export interface EducationItem {
  degree: string;
  institution: string;
  year?: string;
}

export interface ProjectItem {
  title: string;
  description: string;
}

export interface CandidateProfile {
  _id: string;
  id?: string;
  fileName?: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  phone?: string;
  location?: string;
  title?: string;
  role?: string;
  company?: string;
  totalExperience?: number;
  skills?: string[];
  education?: EducationItem[];
  experience?: ExperienceItem[];
  projects?: ProjectItem[];
  certifications?: string[];
  jobTitles?: string[];
  experienceSummary?: string;
  rawText?: string;
  text?: string;
  processedAt?: string;
}
