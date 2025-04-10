
import React from 'react';
import { Button } from '@/components/ui/button';
import { User, Briefcase, GraduationCap, Award, BookOpen, Settings } from 'lucide-react';

interface SectionNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const SectionNav = ({ activeSection, onSectionChange }: SectionNavProps) => {
  return (
    <div className="p-4 space-y-2">
      <Button 
        variant={activeSection === 'personal' ? 'default' : 'ghost'} 
        className="w-full justify-start"
        onClick={() => onSectionChange('personal')}
      >
        <User className="h-4 w-4 mr-2" />
        Personal Info
      </Button>
      <Button 
        variant={activeSection === 'experience' ? 'default' : 'ghost'} 
        className="w-full justify-start"
        onClick={() => onSectionChange('experience')}
      >
        <Briefcase className="h-4 w-4 mr-2" />
        Experience
      </Button>
      <Button 
        variant={activeSection === 'education' ? 'default' : 'ghost'} 
        className="w-full justify-start"
        onClick={() => onSectionChange('education')}
      >
        <GraduationCap className="h-4 w-4 mr-2" />
        Education
      </Button>
      <Button 
        variant={activeSection === 'skills' ? 'default' : 'ghost'} 
        className="w-full justify-start"
        onClick={() => onSectionChange('skills')}
      >
        <Award className="h-4 w-4 mr-2" />
        Skills
      </Button>
      <Button 
        variant={activeSection === 'projects' ? 'default' : 'ghost'} 
        className="w-full justify-start"
        onClick={() => onSectionChange('projects')}
      >
        <BookOpen className="h-4 w-4 mr-2" />
        Projects
      </Button>
      <Button 
        variant={activeSection === 'customize' ? 'default' : 'ghost'} 
        className="w-full justify-start"
        onClick={() => onSectionChange('customize')}
      >
        <Settings className="h-4 w-4 mr-2" />
        Customize
      </Button>
    </div>
  );
};
