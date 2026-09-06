import apiClient from './client';
import type { CandidateProfile } from '@/types/candidate.types';

function cleanTitle(roleStr?: string): string | undefined {
  if (!roleStr || typeof roleStr !== 'string') return undefined;
  const clean = roleStr.replace(/•/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  if (clean.length > 80) {
    const firstSentence = clean.split('.')[0];
    return firstSentence.length <= 80 ? firstSentence : clean.substring(0, 75) + '...';
  }
  return clean;
}

function cleanCompany(companyStr?: string): string | undefined {
  if (!companyStr || typeof companyStr !== 'string') return undefined;
  const clean = companyStr.replace(/•/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  if (clean.length > 80) {
    return clean.substring(0, 75) + '...';
  }
  return clean;
}

export const candidateApi = {
  async getCandidate(id: string): Promise<CandidateProfile> {
    try {
      const response = await apiClient.get(`/v1/search/candidate/${id}`);
      const data = response.data.candidate || response.data;

      const role = cleanTitle(data.role || data.title);
      const company = cleanCompany(data.company);

      return {
        _id: data._id || data.id || id,
        id: data.id || data._id || id,
        fileName: data.fileName,
        name: data.name || 'Candidate',
        email: data.email,
        phoneNumber: data.phoneNumber || data.phone,
        phone: data.phone || data.phoneNumber,
        location: data.location,
        title: role,
        role: role,
        company: company !== role ? company : undefined,
        totalExperience: data.totalExperience,
        skills: Array.isArray(data.skills) ? data.skills : [],
        education: Array.isArray(data.education)
          ? data.education
          : typeof data.education === 'string'
          ? [{ degree: data.education, institution: '' }]
          : [],
        experience: Array.isArray(data.experience)
          ? data.experience
          : data.experienceSummary
          ? [{ company: company || '', title: role || '', description: data.experienceSummary }]
          : [],
        projects: Array.isArray(data.projects) ? data.projects : [],
        certifications: Array.isArray(data.certifications) ? data.certifications : [],
        jobTitles: Array.isArray(data.jobTitles) ? data.jobTitles : [],
        experienceSummary: data.experienceSummary,
        rawText: data.rawText || data.text,
        text: data.rawText || data.text,
        processedAt: data.processedAt || data.createdAt,
      };
    } catch (err: any) {
      console.warn('[candidateApi] Fetch candidate failed, attempting /candidate/:id fallback:', err);
      const fallbackRes = await apiClient.get(`/candidate/${id}`);
      const data = fallbackRes.data.candidate || fallbackRes.data;

      const role = cleanTitle(data.role || data.title);
      const company = cleanCompany(data.company);

      return {
        _id: data._id || id,
        name: data.name || 'Candidate',
        email: data.email,
        phoneNumber: data.phoneNumber || data.phone,
        location: data.location,
        title: role,
        company: company,
        totalExperience: data.totalExperience,
        skills: data.skills || [],
        experience: data.experience || [],
        education: data.education || [],
        rawText: data.rawText || data.text,
      };
    }
  },
};
