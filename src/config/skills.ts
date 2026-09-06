export const SKILLS: string[] = [
  'Java',
  'Core Java',
  'Selenium',
  'Selenium WebDriver',
  'Playwright',
  'API Testing',
  'Postman',
  'SQL',
  'MongoDB',
  'Jenkins',
  'Python',
  'C#',
  'C++',
  '.NET',
  'Node.js',
  'TypeScript',
  'JavaScript',
  'REST Assured',
  'Cucumber',
  'GenAI',
  'Langchain',
  'Langgraph',
  'RAG',
  'Azure DevOps',
  'AWS Lambda',
  'GitHub',
  'DeepEval',
  'MCP (Model Context Protocol)',
  'Docker',
  'Kubernetes',
  'React',
  'Express',
  'Git',
  'CI/CD',
  'Digital Marketing',
  'SEO',
  'Social Media',
];

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function detectSkills(rawText: string): string[] {
  if (!rawText || typeof rawText !== 'string') return [];

  const foundSkills = new Set<string>();

  for (const skill of SKILLS) {
    let regex: RegExp;

    if (skill === 'C#') {
      regex = /(?:\bC#\b|c#)/i;
    } else if (skill === 'C++') {
      regex = /(?:\bC\+\+\b|c\+\+)/i;
    } else if (skill === '.NET') {
      regex = /(?:\.NET\b|\bdotnet\b)/i;
    } else {
      const escaped = escapeRegex(skill);
      regex = new RegExp(`(?<=^|[^a-zA-Z0-9_])${escaped}(?=$|[^a-zA-Z0-9_])`, 'i');
    }

    if (regex.test(rawText)) {
      foundSkills.add(skill);
    }
  }

  return Array.from(foundSkills);
}
