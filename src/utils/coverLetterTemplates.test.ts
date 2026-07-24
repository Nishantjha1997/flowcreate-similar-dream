import { describe, it, expect } from 'vitest';
import { coverLetterTemplateStyles, coverLetterTemplateNames, DEFAULT_COVER_LETTER_TEMPLATE } from './coverLetterTemplates';

const REQUIRED_KEYS = ['container', 'date', 'salutation', 'body', 'closing', 'signatureName'] as const;

describe('coverLetterTemplates', () => {
  it('has at least 8 templates (F-2c: grew from 3)', () => {
    expect(Object.keys(coverLetterTemplateStyles).length).toBeGreaterThanOrEqual(8);
  });

  it('gives every template a display name', () => {
    for (const key of Object.keys(coverLetterTemplateStyles)) {
      expect(coverLetterTemplateNames[key]).toBeTruthy();
    }
  });

  it('defines every required style key for every template', () => {
    for (const styles of Object.values(coverLetterTemplateStyles)) {
      for (const requiredKey of REQUIRED_KEYS) {
        expect(styles).toHaveProperty(requiredKey);
      }
    }
  });

  it('keeps the default template registered', () => {
    expect(coverLetterTemplateStyles[DEFAULT_COVER_LETTER_TEMPLATE]).toBeDefined();
  });
});
