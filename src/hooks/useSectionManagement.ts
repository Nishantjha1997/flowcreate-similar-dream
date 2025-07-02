import { useState } from 'react';

export const useSectionManagement = () => {
  const [activeSection, setActiveSection] = useState('personal');
  
  const defaultSectionOrder = ['personal', 'experience', 'education', 'skills', 'projects'];
  const [activeSections, setActiveSections] = useState<string[]>(defaultSectionOrder);
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const handleSectionsChange = (active: string[], hidden: string[]) => {
    setActiveSections(active);
    setHiddenSections(hidden);
  };

  return {
    activeSection,
    activeSections,
    hiddenSections,
    handleSectionChange,
    handleSectionsChange
  };
};