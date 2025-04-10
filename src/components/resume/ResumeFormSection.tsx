
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PersonalInfoSection } from '@/components/resume/PersonalInfoSection';
import { ExperienceSection } from '@/components/resume/ExperienceSection';
import { EducationSection } from '@/components/resume/EducationSection';
import { SkillsSection } from '@/components/resume/SkillsSection';
import { ProjectsSection } from '@/components/resume/ProjectsSection';
import { CustomizationPanel } from '@/components/CustomizationPanel';
import { ResumeData } from '@/utils/resumeAdapterUtils';

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
  handleCustomizationChange
}: ResumeFormSectionProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        {activeSection === 'personal' && (
          <PersonalInfoSection 
            personal={resume.personal}
            onChange={handlePersonalInfoChange}
          />
        )}

        {activeSection === 'experience' && (
          <ExperienceSection 
            experience={resume.experience}
            onExperienceChange={handleExperienceChange}
            onCurrentJobToggle={handleCurrentJobToggle}
            addExperience={addExperience}
            removeExperience={removeExperience}
          />
        )}

        {activeSection === 'education' && (
          <EducationSection
            education={resume.education}
            onEducationChange={handleEducationChange}
            addEducation={addEducation}
            removeEducation={removeEducation}
          />
        )}

        {activeSection === 'skills' && (
          <SkillsSection 
            skills={resume.skills}
            onSkillsChange={handleSkillsChange}
          />
        )}

        {activeSection === 'projects' && (
          <ProjectsSection 
            projects={resume.projects}
            onProjectChange={handleProjectChange}
            addProject={addProject}
            removeProject={removeProject}
          />
        )}

        {activeSection === 'customize' && (
          <CustomizationPanel 
            customization={resume.customization} 
            onCustomizationChange={handleCustomizationChange}
            resumeData={resume}
          />
        )}
      </CardContent>
    </Card>
  );
};
