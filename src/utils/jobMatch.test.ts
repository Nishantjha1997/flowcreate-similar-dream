import { describe, expect, it } from 'vitest';
import { applyJobRecommendation, normalizeJobMatchResult } from './jobMatch';
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
});
