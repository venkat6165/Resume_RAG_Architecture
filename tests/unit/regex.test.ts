import { extractEmail, extractPhone, extractTotalExperience } from '../../src/modules/ingestion/utils/regex';

describe('Regex Utilities (Phase 7)', () => {
  test('extracts total experience correctly', () => {
    expect(extractTotalExperience('13+ years of experience in QA architecture')).toBe(13);
    expect(extractTotalExperience('Worked for 5.5 yrs in software development')).toBe(5.5);
    expect(extractTotalExperience('No experience listed')).toBeUndefined();
  });

  test('extracts email addresses correctly', () => {
    expect(extractEmail('Contact me at rajesh.kumar@example.com for details')).toBe('rajesh.kumar@example.com');
    expect(extractEmail('No email available')).toBeUndefined();
  });

  test('extracts phone numbers correctly', () => {
    expect(extractPhone('Phone: +91 9876543210')).toBe('+91 9876543210');
    expect(extractPhone('Contact: 9876543210')).toBe('9876543210');
  });
});
