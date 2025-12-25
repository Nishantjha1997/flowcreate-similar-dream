import { Check, AlertCircle } from 'lucide-react';
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
  const totalProgress = (completedSections / sections.length) * 100;

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Progress</span>
        <Badge variant={totalProgress === 100 ? "default" : "secondary"} className="text-[10px] h-5">
          {Math.round(totalProgress)}%
        </Badge>
      </div>
      
      <Progress value={totalProgress} className="h-1.5 mb-2" />
      
      <div className="flex flex-wrap gap-1">
        {sections.map((section) => (
          <button
            key={section.key}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
              section.completed 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            onClick={() => onSectionClick(section.key)}
          >
            {section.completed ? (
              <Check className="h-2.5 w-2.5" />
            ) : (
              <AlertCircle className="h-2.5 w-2.5" />
            )}
            <span>{section.name}</span>
            {section.required && !section.completed && <span className="text-destructive">*</span>}
          </button>
        ))}
      </div>
    </div>
  );
}