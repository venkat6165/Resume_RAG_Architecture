import { ParsedResume } from '../types/ingestion.types';
import { extractEmail, extractPhone, extractTotalExperience } from '../utils/regex';
import { detectSkills } from '../../../config/skills';

export class AlgorithmResumeParser {
  parseResume(rawText: string): ParsedResume {
    if (!rawText) {
      return { skills: [] };
    }

    const lines = rawText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    // 1. Extract Name (Line 1-3 candidate, excluding non-name lines)
    const name = this.extractName(lines);

    // 2. Extract Contact Info
    const email = extractEmail(rawText);
    const phone = extractPhone(rawText);

    // 3. Extract Experience
    const totalExperience = extractTotalExperience(rawText);

    // 4. Extract Skills
    const skills = detectSkills(rawText);

    // 5. Extract Education
    const education = this.extractEducation(rawText, lines);

    // 6. Extract Role / Job Titles
    const role = this.extractPrimaryRole(lines);
    const jobTitles = this.extractJobTitles(rawText);

    // 7. Extract Company
    const company = this.extractCompany(rawText, lines);

    // Build parsed resume result, omitting undefined/null values
    const result: ParsedResume = {
      skills,
    };

    if (name) result.name = name;
    if (email) result.email = email;
    if (phone) result.phone = phone;
    if (role) result.role = role;
    if (company) result.company = company;
    if (education) result.education = education;
    if (totalExperience !== undefined) result.totalExperience = totalExperience;
    if (jobTitles && jobTitles.length > 0) result.jobTitles = jobTitles;

    return result;
  }

  private extractName(lines: string[]): string | undefined {
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];

      // Skip non-name header lines
      if (
        /resume|curriculum|vitae|email|phone|contact|address|http|@|\d{5,}/i.test(line)
      ) {
        continue;
      }

      // Name candidate should be 2 to 4 words of valid characters
      if (/^[A-Za-z\s.'-]{2,40}$/.test(line) && line.split(/\s+/).length <= 5) {
        return line.trim();
      }
    }
    return undefined;
  }

  private extractPrimaryRole(lines: string[]): string | undefined {
    const roleRegex = /\b(Architect|Test Engineer|Software Engineer|Lead|Developer|Specialist|Manager|Consultant|Analyst|Designer|Director|QA Engineer)\b/i;

    for (let i = 0; i < Math.min(6, lines.length); i++) {
      const line = lines[i];
      if (roleRegex.test(line) && !/@|http|resume/i.test(line)) {
        return line.trim();
      }
    }
    return undefined;
  }

  private extractJobTitles(rawText: string): string[] | undefined {
    const titleRegexes = [
      /\b(?:Senior\s+|Lead\s+|Principal\s+|Staff\s+)?(?:Test Architect|Agentic Test Engineer|Software Engineer|Test Engineer|QA Engineer|Full Stack Developer|Backend Developer|Frontend Developer|Digital Marketing Specialist|Marketing Specialist|Project Manager)\b/gi,
    ];

    const found = new Set<string>();
    for (const regex of titleRegexes) {
      const matches = rawText.match(regex);
      if (matches) {
        matches.forEach((m) => found.add(m.trim()));
      }
    }

    return found.size > 0 ? Array.from(found) : undefined;
  }

  private extractCompany(rawText: string, lines: string[]): string | undefined {
    // Check for company suffix (Pvt Ltd, Private Limited, Inc, Corp, Technologies, Solutions, LLC)
    const companySuffixRegex = /([A-Z][A-Za-z0-9\s&,.-]{2,50}(?:Private Limited|Pvt\.?\s*Ltd\.?|Inc\.?|Corp\.?|Corporation|Solutions|Technologies|Software|LLC))/i;
    const match = rawText.match(companySuffixRegex);
    if (match && match[1]) {
      return match[1].trim();
    }

    // Check line-by-line near experience section
    for (const line of lines) {
      if (/\b(?:at|company|employer|organization)[:\s]+([A-Z][A-Za-z0-9\s&,.-]{2,40})/i.test(line)) {
        const m = line.match(/\b(?:at|company|employer|organization)[:\s]+([A-Z][A-Za-z0-9\s&,.-]{2,40})/i);
        if (m && m[1]) return m[1].trim();
      }
    }

    return undefined;
  }

  private extractEducation(rawText: string, lines: string[]): string | undefined {
    const eduRegex = /(?:B\.?\s*Tech|B\.?\s*E|B\.?\s*S|M\.?\s*Tech|M\.?\s*S|M\.?\s*B\.?\s*A|Bachelor|Master|Diploma|Degree)[A-Za-z0-9\s\-,.()]{2,60}/i;
    const match = rawText.match(eduRegex);
    if (match) {
      return match[0].trim();
    }

    for (const line of lines) {
      if (/education|degree|qualification/i.test(line)) {
        return line.trim();
      }
    }

    return undefined;
  }
}

export const algorithmResumeParser = new AlgorithmResumeParser();
