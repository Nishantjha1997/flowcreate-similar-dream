
import React from 'react';
import { PersonalInfoSection } from './PersonalInfoSection';
import { ExperienceSection } from './ExperienceSection';
import { EducationSection } from './EducationSection';
import { SkillsSection } from './SkillsSection';
import { ProjectsSection } from './ProjectsSection';
import { CustomizationPanel } from '../CustomizationPanel';
import { ResumeData } from '@/utils/types';

interface ResumeFormSectionProps {
  activeSection: string;
  resume: ResumeData;
  handlePersonalInfoChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleExperienceChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => void;
  handleCurrentJobToggle: (checked: boolean, index: number) => void;
  addExperience: () => void;
  removeExperience: (id: number) => void;
  handleEducationChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => void;
  addEducation: () => void;
  removeEducation: (id: number) => void;
  handleSkillsChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleProjectChange: (field: string, value: string, index: number) => void;
  addProject: () => void;
  removeProject: (id: number) => void;
  handleCustomizationChange: (customization: ResumeData['customization']) => void;
  onAIFeatureUpsell?: () => void;
  isPremium?: boolean;
}

export const ResumeFormSection = ({
  activeSection,
  resume,
  handlePersonalInfoChange,
  handleExperienceChange,
  handleCurrentJobToggle,
  addExperience,
  removeExperience,
  handleEducationChange,
  addEducation,
  removeEducation,
  handleSkillsChange,
  handleProjectChange,
  addProject,
  removeProject,
  handleCustomizationChange,
  onAIFeatureUpsell,
  isPremium
}: ResumeFormSectionProps) => {
  
  const renderSection = () => {
    switch (activeSection) {
      case 'personal':
        return (
          <PersonalInfoSection
            personal={resume.personal}
            onChange={handlePersonalInfoChange}
            onAIFeatureUpsell={onAIFeatureUpsell}
            isPremium={isPremium}
          />
        );
      case 'experience':
        return (
          <ExperienceSection
            experience={resume.experience}
            onChange={handleExperienceChange}
            onCurrentJobToggle={handleCurrentJobToggle}
            onAdd={addExperience}
            onRemove={removeExperience}
            onAIFeatureUpsell={onAIFeatureUpsell}
            isPremium={isPremium}
          />
        );
      case 'education':
        return (
          <EducationSection
            education={resume.education}
            onChange={handleEducationChange}
            onAdd={addEducation}
            onRemove={removeEducation}
            onAIFeatureUpsell={onAIFeatureUpsell}
            isPremium={isPremium}
          />
        );
      case 'skills':
        return (
          <SkillsSection
            skills={resume.skills}
            onChange={handleSkillsChange}
            onAIFeatureUpsell={onAIFeatureUpsell}
            isPremium={isPremium}
          />
        );
      case 'projects':
        return (
          <ProjectsSection
            projects={resume.projects || []}
            onChange={handleProjectChange}
            onAdd={addProject}
            onRemove={removeProject}
            onAIFeatureUpsell={onAIFeatureUpsell}
            isPremium={isPremium}
          />
        );
      case 'customization':
        return (
          <CustomizationPanel
            customization={resume.customization}
            onCustomizationChange={handleCustomizationChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {renderSection()}
    </div>
  );
};
