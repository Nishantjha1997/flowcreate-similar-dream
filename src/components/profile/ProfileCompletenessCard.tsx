import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, User, Briefcase, GraduationCap, Star } from 'lucide-react';
import { UserProfile } from '@/hooks/useUserProfile';

interface ProfileCompletenessCardProps {
  profile: UserProfile | null;
  completeness: number;
}

export const ProfileCompletenessCard = ({ profile, completeness }: ProfileCompletenessCardProps) => {
  const sections = [
    {
      name: 'Personal Information',
      icon: User,
      completed: !!(profile?.full_name && profile?.email && profile?.phone),
      description: 'Basic contact details'
    },
    {
      name: 'Professional Summary',
      icon: Star,
      completed: !!(profile?.professional_summary && profile?.current_position),
      description: 'Career overview and current role'
    },
    {
      name: 'Work Experience',
      icon: Briefcase,
      completed: !!(profile?.work_experience && profile.work_experience.length > 0),
      description: 'Employment history'
    },
    {
      name: 'Education',
      icon: GraduationCap,
      completed: !!(profile?.education && profile.education.length > 0),
      description: 'Educational background'
    }
  ];

  const completedSections = sections.filter(section => section.completed).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          Profile Completeness
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm text-muted-foreground">{completeness}%</span>
        </div>
        
        <Progress value={completeness} className="h-2" />
        
        <div className="space-y-3 pt-2">
          {sections.map((section) => {
            const IconComponent = section.icon;
            return (
              <div key={section.name} className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {section.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{section.name}</p>
                    <p className="text-xs text-muted-foreground">{section.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {completeness < 100 && (
          <div className="pt-2 mt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Complete your profile to create better resumes automatically!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};