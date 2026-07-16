import { describe, it, expect, vi } from 'vitest';
import { resolveTemplateKey, getTemplate, DEFAULT_KEY } from './registry';

describe('registry', () => {
  describe('resolveTemplateKey', () => {
    it('returns default key for null or undefined', () => {
      expect(resolveTemplateKey(null)).toBe(DEFAULT_KEY);
      expect(resolveTemplateKey(undefined)).toBe(DEFAULT_KEY);
    });

    it('returns the same canonical key if valid', () => {
      expect(resolveTemplateKey('clean-slate')).toBe('clean-slate');
      expect(resolveTemplateKey('executive-serif')).toBe('executive-serif');
    });

    it('resolves legacy IDs to their canonical keys', () => {
      expect(resolveTemplateKey('1')).toBe('clean-slate');
      expect(resolveTemplateKey('modern')).toBe('clean-slate');
      expect(resolveTemplateKey('2')).toBe('executive-serif');
      expect(resolveTemplateKey('7')).toBe('emerald-minimal');
    });

    it('returns default key and warns for unknown keys', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(resolveTemplateKey('non-existent-template-999')).toBe(DEFAULT_KEY);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[registry] Unknown template id/key')
      );
      consoleSpy.mockRestore();
    });
  });

  describe('getTemplate', () => {
    it('returns the correct template definition', () => {
      const template = getTemplate('clean-slate');
      expect(template.key).toBe('clean-slate');
      expect(template.name).toBe('Clean Slate');
    });

    it('falls back to the first template if key is unknown', () => {
      const template = getTemplate('unknown-key-123');
      expect(template.key).toBe(DEFAULT_KEY);
    });
  });
});
