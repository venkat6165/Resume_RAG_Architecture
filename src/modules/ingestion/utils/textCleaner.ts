const COMMON_ENGLISH_WORDS = new Set([
  'A', 'I', 'IN', 'ON', 'AT', 'TO', 'OR', 'IS', 'IT', 'BY', 'OF', 'AN', 'BE', 'AS',
  'IF', 'WE', 'SO', 'DO', 'NO', 'GO', 'MY', 'HE', 'UP', 'US', 'AM', 'SH', 'AND',
  'FOR', 'THE', 'SEO', '|', '&', '-', '/', 'QA', 'UI', 'UX', 'AI', 'ML', 'DB'
]);

function fixLineFragments(tokens: string[]): string {
  if (tokens.length === 0) return '';

  const result: string[] = [];
  let currentWord = '';

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const upper = token.toUpperCase();

    if (COMMON_ENGLISH_WORDS.has(upper) || (currentWord && COMMON_ENGLISH_WORDS.has(currentWord.toUpperCase()))) {
      if (currentWord) result.push(currentWord);
      currentWord = token;
      continue;
    }

    if (!currentWord) {
      currentWord = token;
      continue;
    }

    const isSingleChar = token.length === 1;
    const isPrevSingleChar = currentWord.length === 1;
    const isShortSuffix = token.length <= 2 && currentWord.length >= 3;
    const isShortPrefix = currentWord.length <= 2 && token.length >= 3;

    if (isSingleChar || isPrevSingleChar || isShortSuffix || isShortPrefix) {
      currentWord += token;
    } else {
      result.push(currentWord);
      currentWord = token;
    }
  }

  if (currentWord) {
    result.push(currentWord);
  }

  return result.join(' ');
}

export function cleanText(rawText: string): string {
  if (!rawText || typeof rawText !== 'string') return '';

  return rawText
    // Remove control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Replace bullet points and tabs with spaces
    .replace(/[•\u2022\u2023\u25E6\u2043\u2219\t]/g, ' ')
    // Standardize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Pad common punctuation separators with spaces to prevent accidental word merges
    .replace(/([|&,/])/g, ' $1 ')
    // Process line by line
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const tokens = line.split(/\s+/).filter(Boolean);
      return fixLineFragments(tokens).replace(/\s+([|&,/])\s+/g, ' $1 ');
    })
    .join('\n')
    // Final trim
    .trim();
}
