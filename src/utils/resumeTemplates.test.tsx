import { describe, it, expect } from 'vitest';
import { applyCustomization, TemplateStyles } from './resumeTemplates';
import { ResumeData } from './resumeAdapterUtils';

describe('resumeTemplates', () => {
  describe('applyCustomization', () => {
    const baseStyles: TemplateStyles = {
      container: { fontSize: '14px', lineHeight: 1.5, color: '#333' },
      header: { backgroundColor: '#fff' },
      name: { fontSize: '24px', color: '#111' },
      sectionTitle: { fontSize: '18px', borderBottom: '1px solid #ccc' },
      itemTitle: { fontWeight: 'bold' },
      itemSubtitle: { fontStyle: 'italic' },
      itemDescription: {},
      itemDate: { color: '#666' },
      contact: {},
      section: {},
      sectionContent: {},
      item: {},
      skillsList: {},
      skill: {},
    };

    it('returns base styles if no customization is provided', () => {
      const result = applyCustomization(baseStyles);
      expect(result).toEqual(baseStyles);
    });

    it('applies primaryColor correctly', () => {
      const custom: ResumeData['customization'] = {
        primaryColor: '#ff0000',
      };
      const result = applyCustomization(baseStyles, custom);
      expect(result.name?.color).toBe('#ff0000');
      expect(result.sectionTitle?.color).toBe('#ff0000');
    });

    it('performs px math correctly for font size scaling (no NaNs)', () => {
      const custom: ResumeData['customization'] = {
        primaryColor: '#000000',
        fontSize: 'large', // scale factor 1.1
      };
      
      const result = applyCustomization(baseStyles, custom);
      
      // 24 * 1.1 = 26.4
      expect(result.name?.fontSize).toBe('26.4px');
      // No container scaling in the function, it scales specific text elements.
      // So we don't test container.
    });

    it('handles numeric font sizes safely without NaN', () => {
      const custom: ResumeData['customization'] = {
        primaryColor: '#000000',
        fontSize: 'small', // scale factor 0.9
      };
      
      const numericBaseStyles: TemplateStyles = {
        ...baseStyles,
        name: { fontSize: 30 }, // Should be handled correctly or ignored if the code only parses strings
      };
      
      const result = applyCustomization(numericBaseStyles, custom);
      // 30 * 0.9 = 27
      expect(result.name?.fontSize).toBe('27px');
    });

    it('adjusts line height correctly', () => {
      const custom: ResumeData['customization'] = {
        primaryColor: '#000000',
        lineHeight: 'relaxed',
      };
      const result = applyCustomization(baseStyles, custom);
      expect(result.itemDescription?.lineHeight).toBe('1.8');
    });
  });
});
