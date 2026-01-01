import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, User, Briefcase, GraduationCap, Star, Clock, Wrench, Code, Award, Heart, ChevronRight } from 'lucide-react';
import { UserProfile } from '@/hooks/useUserProfile';

interface ProfileCompletenessCardProps {
  profile: UserProfile | null;
  completeness: number;
  onSectionClick?: (tabId: string) => void;
  isNeoBrutalism?: boolean;
}

export const ProfileCompletenessCard = ({ 
  profile, 
  completeness, 
  onSectionClick,
  isNeoBrutalism = false 
}: ProfileCompletenessCardProps) => {
  const sections = [
    {
      name: 'Personal Information',
      tabId: 'personal',
      icon: User,
      completed: !!(profile?.full_name && profile?.email && profile?.phone),
      description: 'Basic contact details'
    },
    {
      name: 'Professional Summary',
      tabId: 'professional',
      icon: Briefcase,
      completed: !!(profile?.professional_summary && profile?.current_position),
      description: 'Career overview and current role'
    },
    {
      name: 'Work Experience',
      tabId: 'experience',
      icon: Clock,
      completed: !!(profile?.work_experience && profile.work_experience.length > 0),
      description: 'Employment history'
    },
    {
      name: 'Education',
      tabId: 'education',
      icon: GraduationCap,
      completed: !!(profile?.education && profile.education.length > 0),
      description: 'Educational background'
    },
    {
      name: 'Skills & Languages',
      tabId: 'skills',
      icon: Wrench,
      completed: !!(profile?.technical_skills && profile.technical_skills.length > 0),
      description: 'Technical and soft skills'
    },
    {
      name: 'Projects',
      tabId: 'projects',
      icon: Code,
      completed: !!(profile?.projects && profile.projects.length > 0),
      description: 'Portfolio projects'
    },
    {
      name: 'Certifications',
      tabId: 'certifications',
      icon: Award,
      completed: !!(profile?.certifications && profile.certifications.length > 0),
      description: 'Professional certifications'
    },
    {
      name: 'Volunteer Work',
      tabId: 'volunteer',
      icon: Heart,
      completed: !!(profile?.volunteer_experience && profile.volunteer_experience.length > 0),
      description: 'Community involvement'
    }
  ];

  const completedSections = sections.filter(section => section.completed).length;

  return (
    <Card className={isNeoBrutalism ? 'border-3 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))]' : ''}>
      <CardHeader className="pb-3">
        <CardTitle className={`flex items-center gap-2 text-base ${isNeoBrutalism ? 'uppercase font-black' : ''}`}>
          <div className={`w-2 h-2 rounded-full ${isNeoBrutalism ? 'bg-primary' : 'bg-primary'}`}></div>
          Profile Completeness
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className={`text-sm font-bold ${isNeoBrutalism ? 'bg-primary text-primary-foreground px-2 py-0.5' : 'text-muted-foreground'}`}>
            {completeness}%
          </span>
        </div>
        
        <Progress 
          value={completeness} 
          className={`h-3 ${isNeoBrutalism ? 'border-2 border-foreground' : ''}`} 
        />
        
        <div className="space-y-1 pt-2">
          {sections.map((section) => {
            const IconComponent = section.icon;
            const isClickable = onSectionClick && !section.completed;
            
            return (
              <button
                key={section.name}
                onClick={() => onSectionClick?.(section.tabId)}
                disabled={!onSectionClick}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left ${
                  onSectionClick 
                    ? isNeoBrutalism
                      ? 'hover:bg-muted border border-transparent hover:border-foreground'
                      : 'hover:bg-muted/50'
                    : ''
                } ${!section.completed && onSectionClick ? 'cursor-pointer' : ''}`}
              >
                <div className="flex-shrink-0">
                  {section.completed ? (
                    <CheckCircle className={`h-4 w-4 ${isNeoBrutalism ? 'text-green-600' : 'text-green-500'}`} />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <IconComponent className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium truncate ${section.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {section.name}
                    </p>
                  </div>
                </div>
                {!section.completed && onSectionClick && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
        
        {completeness < 100 && (
          <div className={`pt-2 mt-4 border-t ${isNeoBrutalism ? 'border-foreground' : ''}`}>
            <p className={`text-xs ${isNeoBrutalism ? 'font-medium' : 'text-muted-foreground'}`}>
              Complete your profile to create better resumes automatically!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
