import React, { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { 
  User, Briefcase, Clock, GraduationCap, Wrench, Code, Award, Heart 
} from 'lucide-react';

// Profile Components
import { PersonalInfoForm } from './PersonalInfoForm';
import { ProfessionalInfoForm } from './ProfessionalInfoForm';
import { WorkExperienceForm } from './WorkExperienceForm';
import { EducationForm } from './EducationForm';
import { SkillsForm } from './SkillsForm';
import { AdvancedSkillsForm } from './AdvancedSkillsForm';
import { ProjectsForm } from './ProjectsForm';
import { CertificationsForm } from './CertificationsForm';
import { VolunteerForm } from './VolunteerForm';

interface MasterProfileFormProps {
  profile: any;
  onUpdate: (updates: any) => void;
  isNeoBrutalism?: boolean;
  isPremium?: boolean;
}

export const MasterProfileForm = ({
  profile,
  onUpdate,
  isNeoBrutalism = false,
  isPremium = false
}: MasterProfileFormProps) => {
  const [activeSection, setActiveSection] = useState('personal');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: User, component: PersonalInfoForm },
    { id: 'professional', label: 'Professional Summary', icon: Briefcase, component: ProfessionalInfoForm },
    { id: 'experience', label: 'Work Experience', icon: Clock, component: WorkExperienceForm },
    { id: 'education', label: 'Education', icon: GraduationCap, component: EducationForm },
    { 
      id: 'skills', 
      label: 'Skills', 
      icon: Wrench, 
      render: () => (
        <div className="space-y-6">
          <AdvancedSkillsForm 
            profile={profile} 
            onUpdate={onUpdate}
            isPremium={isPremium}
          />
          <SkillsForm 
            profile={profile} 
            onUpdate={onUpdate}
            isNeoBrutalism={isNeoBrutalism}
          />
        </div>
      )
    },
    { id: 'projects', label: 'Projects', icon: Code, component: ProjectsForm },
    { id: 'certifications', label: 'Certifications', icon: Award, component: CertificationsForm },
    { id: 'volunteer', label: 'Volunteer Work', icon: Heart, component: VolunteerForm }
  ];

  // Set up IntersectionObserver to detect which section is in view
  useEffect(() => {
    const observerOptions = {
      root: null, // viewport
      rootMargin: '-20% 0px -60% 0px', // focused in the middle-upper part of viewport
      threshold: 0
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id.replace('profile-section-', ''));
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    sections.forEach(section => {
      const element = document.getElementById(`profile-section-${section.id}`);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(`profile-section-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8 items-start">
      {/* Sticky Left Navigation */}
      <div className="md:col-span-1 md:sticky md:top-24 space-y-2 z-10">
        <Card className={`p-2 bg-card ${isNeoBrutalism ? 'border-3 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]' : 'border shadow-sm'}`}>
          <p className="text-xs font-semibold text-muted-foreground uppercase px-3 py-2 tracking-wider">
            Profile Sections
          </p>
          <nav className="space-y-1">
            {sections.map((section) => {
              const IconComponent = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-all text-left ${
                    isActive 
                      ? isNeoBrutalism
                        ? 'bg-primary text-primary-foreground border-2 border-foreground translate-x-1 shadow-[2px_2px_0px_0px_hsl(var(--foreground))]'
                        : 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </nav>
        </Card>
      </div>

      {/* Right Column - Scrollable Forms */}
      <div ref={scrollContainerRef} className="md:col-span-3 space-y-8 pb-24">
        {sections.map((section) => (
          <div 
            key={section.id} 
            id={`profile-section-${section.id}`} 
            className="scroll-mt-24 animate-fade-in"
          >
            {section.render ? (
              section.render()
            ) : (
              section.component && React.createElement(section.component, {
                profile,
                onUpdate,
                isNeoBrutalism
              })
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
