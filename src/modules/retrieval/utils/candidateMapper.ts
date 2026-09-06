import { Candidate } from '../types/retrieval.types';

export function extractSkillsFallback(doc: any): string[] {
  if (Array.isArray(doc.skills) && doc.skills.length > 0) {
    return doc.skills;
  }

  const fallbackSkills: string[] = [];

  if (Array.isArray(doc.jobTitles) && doc.jobTitles.length > 0) {
    fallbackSkills.push(...doc.jobTitles);
  }

  if (doc.role && typeof doc.role === 'string' && doc.role.trim().length > 0) {
    fallbackSkills.push(doc.role.trim());
  }

  const text = doc.rawText || '';

  // 1. Extract from "Core Competencies", "Skills", "Key Competencies", "Areas of Expertise", etc.
  const skillsSectionRegex = /(?:core competencies|skills|technical skills|key skills|areas of expertise|competencies)\s*[:\-~]?\s*([\s\S]{1,400})/i;
  const match = text.match(skillsSectionRegex);
  if (match && match[1]) {
    const sectionText = match[1].split(/\n\s*\n/)[0];
    const items = sectionText
      .split(/[~•·|,;\/\n]/)
      .map((s: string) => s.replace(/^[^\w\s&+\-.]+/g, '').replace(/^with\s*\d+.*$/i, '').trim())
      .filter(
        (s: string) =>
          s.length > 2 &&
          s.length < 40 &&
          !/^(with|\d+|years|experience|profile|snapshot|page|candidate|competencies|situations|mastering|streamlining|operations|productivity|in a company|contribute|gained)/i.test(s)
      );

    for (const item of items) {
      if (!fallbackSkills.includes(item) && fallbackSkills.length < 10) {
        fallbackSkills.push(item);
      }
    }
  }

  // 2. Common tech & domain keywords if still empty
  if (fallbackSkills.length === 0) {
    const commonKeywords = [
      'Recruitment', 'Human Resources', 'Talent Acquisition', 'Employee Engagement',
      'Statutory Compliance', 'Training & Development', 'Compensation & Benefits', 'Diversity & Inclusion',
      'Project Management', 'Agile', 'Scrum', 'QA', 'Testing', 'Automation', 'Python', 'Java', 'SQL',
      'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'DevOps', 'RAG', 'LLM', 'AI', 'Machine Learning',
      'Customer Service', 'Sales', 'Business Development', 'Data Analysis'
    ];
    for (const kw of commonKeywords) {
      if (new RegExp(`\\b${kw}\\b`, 'i').test(text)) {
        fallbackSkills.push(kw);
      }
    }
  }

  return fallbackSkills;
}

export function mapDocToCandidate(doc: any, score?: number): Candidate {
  const skills = extractSkillsFallback(doc);

  let snippet = doc.experienceSummary || undefined;
  if (!snippet || snippet.trim().length === 0) {
    if (doc.role && typeof doc.role === 'string' && doc.role.trim().length > 0) {
      snippet = doc.role.trim();
    } else if (skills.length > 0) {
      snippet = skills.join(', ');
    } else if (doc.company && typeof doc.company === 'string' && doc.company.trim().length > 0) {
      snippet = `Experience at ${doc.company.trim()}`;
    } else if (doc.rawText && typeof doc.rawText === 'string' && doc.rawText.trim().length > 0) {
      const cleanText = doc.rawText.replace(/\s+/g, ' ').trim();
      snippet = cleanText.length > 150 ? cleanText.substring(0, 150) + '...' : cleanText;
    } else {
      snippet = 'Resume details available';
    }
  }

  return {
    id: doc._id?.toString() || '',
    fileName: doc.fileName || 'resume.pdf',
    name: doc.name || undefined,
    email: doc.email || undefined,
    phone: doc.phone || undefined,
    location: doc.location || undefined,
    company: doc.company || undefined,
    role: doc.role || undefined,
    education: doc.education || undefined,
    totalExperience: doc.totalExperience ?? undefined,
    skills,
    jobTitles: Array.isArray(doc.jobTitles) ? doc.jobTitles : [],
    experienceSummary: doc.experienceSummary || undefined,
    snippet,
    score: score !== undefined ? parseFloat(score.toFixed(4)) : undefined,
  };
}
