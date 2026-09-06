export const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;

export const PHONE_REGEX = /(\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}|\+?91[\s-]?[789]\d{9}|\b[789]\d{9}\b/;

export const EXPERIENCE_REGEX = /(\d+(?:\.\d+)?)\s*(?:\+)?\s*(?:years?|yrs?)(?:\s+of)?\s*(?:experience|exp)?/i;

export function extractEmail(text: string): string | undefined {
  if (!text) return undefined;
  const match = text.match(EMAIL_REGEX);
  return match ? match[0].trim() : undefined;
}

export function extractPhone(text: string): string | undefined {
  if (!text) return undefined;
  const match = text.match(PHONE_REGEX);
  return match ? match[0].trim() : undefined;
}

export function extractTotalExperience(text: string): number | undefined {
  if (!text) return undefined;
  const match = text.match(EXPERIENCE_REGEX);
  if (match && match[1]) {
    const years = parseFloat(match[1]);
    return isNaN(years) ? undefined : years;
  }
  return undefined;
}
