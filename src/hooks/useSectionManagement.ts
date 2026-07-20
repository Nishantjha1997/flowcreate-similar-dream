import { useCallback, useEffect, useState } from 'react';

export const DEFAULT_RESUME_SECTIONS = ['summary', 'experience', 'education', 'skills', 'projects'];

const arraysEqual = (left: string[], right: string[]) =>
  left.length === right.length && left.every((value, index) => value === right[index]);

export const useSectionManagement = (
  initialSections: string[] = DEFAULT_RESUME_SECTIONS,
  initialHiddenSections: string[] = [],
) => {
  const [activeSection, setActiveSection] = useState('personal');
  const [activeSections, setActiveSections] = useState<string[]>(initialSections);
  const [hiddenSections, setHiddenSections] = useState<string[]>(initialHiddenSections);

  // Existing resumes load asynchronously. Keep the editor state aligned with
  // the section layout stored inside resume_data.customization.
  useEffect(() => {
    const next = initialSections.length > 0 ? initialSections : DEFAULT_RESUME_SECTIONS;
    setActiveSections((current) => arraysEqual(current, next) ? current : [...next]);
  }, [initialSections]);

  useEffect(() => {
    setHiddenSections((current) =>
      arraysEqual(current, initialHiddenSections) ? current : [...initialHiddenSections],
    );
  }, [initialHiddenSections]);

  const handleSectionChange = useCallback((section: string) => {
    setActiveSection(section);
  }, []);

  const handleSectionsChange = useCallback((active: string[], hidden: string[]) => {
    setActiveSections(active);
    setHiddenSections(hidden);
  }, []);

  return {
    activeSection,
    activeSections,
    hiddenSections,
    handleSectionChange,
    handleSectionsChange,
  };
};
