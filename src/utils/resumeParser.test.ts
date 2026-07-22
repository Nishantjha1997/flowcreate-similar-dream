import { describe, expect, it } from 'vitest';

import { parseExtractedJson } from '../../supabase/functions/_shared/resumeParser';

describe('parseExtractedJson', () => {
  it('normalizes model string fields into frontend-safe arrays', () => {
    const parsed = parseExtractedJson(JSON.stringify({
      skills: 'TypeScript, React; PostgreSQL',
      projects: [{ name: 'FlowCreate', technologies: 'React, Supabase' }],
      languages: 'English, Hindi',
    }));

    expect(parsed.skills).toEqual(['TypeScript', 'React', 'PostgreSQL']);
    expect(parsed.projects).toEqual([{
      name: 'FlowCreate',
      technologies: ['React', 'Supabase'],
    }]);
    expect(parsed.languages).toEqual([
      { language: 'English', proficiency: '' },
      { language: 'Hindi', proficiency: '' },
    ]);
  });

  it('preserves valid arrays while dropping unsafe values', () => {
    const parsed = parseExtractedJson(`\`\`\`json
      ${JSON.stringify({
        skills: ['TypeScript', 42, ' React '],
        projects: [{ technologies: ['Vite', null, 'Tailwind'] }, 'invalid'],
        languages: [
          { language: 'English', proficiency: 'Native' },
          'German',
          { proficiency: 'Fluent' },
        ],
      })}
    \`\`\``);

    expect(parsed.skills).toEqual(['TypeScript', 'React']);
    expect(parsed.projects).toEqual([{ technologies: ['Vite', 'Tailwind'] }]);
    expect(parsed.languages).toEqual([
      { language: 'English', proficiency: 'Native' },
      { language: 'German', proficiency: '' },
    ]);
  });

  it('returns a complete safe shape when model output is invalid JSON', () => {
    expect(parseExtractedJson('not JSON')).toMatchObject({
      personal: expect.any(Object),
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      languages: [],
    });
  });
});
