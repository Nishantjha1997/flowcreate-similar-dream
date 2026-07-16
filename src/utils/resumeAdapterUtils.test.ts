import { describe, it, expect } from 'vitest';
import { adaptResumeData, reverseAdaptResumeData, ResumeData } from './resumeAdapterUtils';

const mockResumeData: ResumeData = {
  personal: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    address: '123 Main St',
    summary: 'A summary',
  },
  experience: [
    {
      id: 1,
      title: 'Engineer',
      company: 'Tech Corp',
      location: 'NY',
      startDate: '2020-01-01',
      endDate: '2021-01-01',
      current: false,
      description: 'Did things',
    }
  ],
  education: [],
  skills: ['TypeScript'],
  customization: {
    primaryColor: '#000000',
  }
};

describe('resumeAdapterUtils', () => {
  describe('adaptResumeData & reverseAdaptResumeData round-trip', () => {
    it('preserves data during round-trip conversion', () => {
      // 1. Convert to TypesResumeData
      const adapted = adaptResumeData(mockResumeData);
      
      // 2. Convert back to ResumeData
      const parsed = reverseAdaptResumeData(adapted) as ResumeData;
      
      // 3. Verify fields match
      expect(parsed.personal.name).toBe(mockResumeData.personal.name);
      expect(parsed.experience[0].title).toBe(mockResumeData.experience[0].title);
      expect(parsed.skills).toEqual(mockResumeData.skills);
    });
    
    it('handles null or missing fields gracefully', () => {
      const incompleteData = {
        personal: { name: 'Jane', email: 'jane@example.com', phone: '', address: '', summary: '' },
        experience: [],
        education: [],
        skills: [],
        customization: { primaryColor: '#ffffff' }
      };
      
      const adapted = adaptResumeData(incompleteData);
      const parsed = reverseAdaptResumeData(adapted) as ResumeData;
      
      expect(parsed.personal?.name).toBe('Jane');
      expect(parsed.experience).toEqual([]);
    });
  });
});
