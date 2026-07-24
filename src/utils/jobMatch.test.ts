import { describe, expect, it } from 'vitest';
import {
  applyJobRecommendation,
  buildAddSkillRecommendation,
  formatRoleAtCompany,
  normalizeJobMatchResult,
} from './jobMatch';
import type { ResumeData } from './types';

const resume: ResumeData = {
  personal: { name: 'A', email: 'a@example.com', phone: '', address: '', summary: 'Builder' },
  experience: [{ id: 1, title: 'Engineer', company: 'Acme', location: '', startDate: '', endDate: '', current: true, description: 'Built tools' }],
  education: [],
  skills: ['TypeScript'],
  customization: { primaryColor: '#000000' },
};

describe('job match safeguards', () => {
  it('normalizes malformed AI output and requires approval for recommendations', () => {
    const result = normalizeJobMatchResult({
      score: 88.6,
      matchedKeywords: ['React', 4],
      recommendations: [{
        type: 'rewrite_bullet', section: 'experience', entryIndex: 0,
        currentText: 'Built tools', proposedText: 'Built reliable tools', confidence: 92,
      }, { type: 'unsupported', proposedText: 'bad' }],
    });
    expect(result.score).toBe(89);
    expect(result.matchedKeywords).toEqual(['React']);
    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].requiresConfirmation).toBe(true);
  });

  it('applies only an approved matching change and rejects stale text', () => {
    const recommendation = normalizeJobMatchResult({
      recommendations: [{
        id: 'r1', type: 'rewrite_bullet', section: 'experience', entryIndex: 0,
        currentText: 'Built tools', proposedText: 'Built reliable tools',
      }],
    }).recommendations[0];
    expect(applyJobRecommendation(resume, recommendation)?.experience[0].description).toBe('Built reliable tools');
    expect(applyJobRecommendation({ ...resume, experience: [{ ...resume.experience[0], description: 'Changed manually' }] }, recommendation)).toBeNull();
  });

  it('extracts company/role verbatim and defaults to empty strings, never omitting the fields (F-3b)', () => {
    const withBoth = normalizeJobMatchResult({ score: 80, company: '  Acme Corp  ', role: '  Senior Engineer  ' });
    expect(withBoth.company).toBe('Acme Corp');
    expect(withBoth.role).toBe('Senior Engineer');

    const withNeither = normalizeJobMatchResult({ score: 80 });
    expect(withNeither.company).toBe('');
    expect(withNeither.role).toBe('');
  });

  it('formats "{Role} @ {Company}" for the tailored-copy name, falling back gracefully (F-3b)', () => {
    expect(formatRoleAtCompany('Product Manager', 'Acme Corp')).toBe('Product Manager @ Acme Corp');
    expect(formatRoleAtCompany('Product Manager', '')).toBe('Product Manager');
    expect(formatRoleAtCompany('', 'Acme Corp')).toBe('Acme Corp');
    expect(formatRoleAtCompany('', '')).toBeNull();
  });

  it('"+ Add to skills" reuses the same confirmed-patch path as AI recommendations, and is idempotent (F-3a)', () => {
    const recommendation = buildAddSkillRecommendation('Kubernetes');
    expect(recommendation.type).toBe('add_skill');
    expect(recommendation.section).toBe('skills');
    expect(recommendation.requiresConfirmation).toBe(true);

    const updated = applyJobRecommendation(resume, recommendation);
    expect(updated?.skills).toEqual(['TypeScript', 'Kubernetes']);

    const alreadyHasSkill = buildAddSkillRecommendation('TypeScript');
    expect(applyJobRecommendation(resume, alreadyHasSkill)?.skills).toEqual(['TypeScript']);
  });
});
