import { Check, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ResumeData } from '@/utils/types';

interface ProgressIndicatorProps {
  resume: ResumeData;
  onSectionClick: (section: string) => void;
}

interface SectionStatus {
  name: string;
  key: string;
  completed: boolean;
  required: boolean;
  description: string;
}

export function ProgressIndicator({ resume, onSectionClick }: ProgressIndicatorProps) {
  const getSectionStatus = (): SectionStatus[] => [
    {
      name: 'Personal Info',
      key: 'personal',
      completed: !!(resume.personal?.name && resume.personal?.email),
      required: true,
      description: 'Add your name and contact information'
    },
    {
      name: 'Work Experience',
      key: 'experience',
      completed: !!(resume.experience && resume.experience.length > 0),
      required: true,
      description: 'Add at least one work experience'
    },
    {
      name: 'Education',
      key: 'education',
      completed: !!(resume.education && resume.education.length > 0),
      required: true,
      description: 'Add your educational background'
    },
    {
      name: 'Skills',
      key: 'skills',
      completed: !!(resume.skills && resume.skills.length > 0),
      required: true,
      description: 'List your key skills and competencies'
    },
    {
      name: 'Projects',
      key: 'projects',
      completed: !!(resume.projects && resume.projects.length > 0),
      required: false,
      description: 'Showcase your notable projects'
    }
  ];

  const sections = getSectionStatus();
  const completedSections = sections.filter(s => s.completed).length;
  const requiredSections = sections.filter(s => s.required).length;
  const completedRequired = sections.filter(s => s.required && s.completed).length;
  const totalProgress = (completedSections / sections.length) * 100;
  const requiredProgress = (completedRequired / requiredSections) * 100;

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Resume Completion</h3>
          <Badge variant={requiredProgress === 100 ? "default" : "secondary"}>
            {Math.round(totalProgress)}% Complete
          </Badge>
        </div>
        
        <Progress value={totalProgress} className="mb-4" />
        
        <div className="space-y-2">
          {sections.map((section) => (
            <div
              key={section.key}
              className="flex items-center justify-between p-2 rounded-lg border border-border/50 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => onSectionClick(section.key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSectionClick(section.key);
                }
              }}
              aria-label={`Edit ${section.name} section`}
            >
              <div className="flex items-center gap-2">
                {section.completed ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <span className="text-sm font-medium">{section.name}</span>
                  {section.required && <span className="text-red-500 ml-1">*</span>}
                  {!section.completed && (
                    <p className="text-xs text-muted-foreground">{section.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {requiredProgress < 100 && (
          <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              Complete all required sections (*) to create a professional resume
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}