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
    { name: 'Personal', key: 'personal', completed: !!(resume.personal?.name && resume.personal?.email), required: true, description: 'Name and contact' },
    { name: 'Experience', key: 'experience', completed: !!(resume.experience?.length > 0), required: true, description: 'Work history' },
    { name: 'Education', key: 'education', completed: !!(resume.education?.length > 0), required: true, description: 'Education' },
    { name: 'Skills', key: 'skills', completed: !!(resume.skills?.length > 0), required: true, description: 'Skills' },
    { name: 'Projects', key: 'projects', completed: !!(resume.projects?.length > 0), required: false, description: 'Projects' },
  ];

  const sections = getSectionStatus();
  const completedSections = sections.filter(s => s.completed).length;
  const totalProgress = (completedSections / sections.length) * 100;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground tracking-wide">Progress</span>
        <span className="text-xs font-semibold text-foreground tabular-nums">{Math.round(totalProgress)}%</span>
      </div>
      
      <div className="h-1 bg-muted rounded-full overflow-hidden mb-3">
        <div 
          className="h-full bg-foreground rounded-full transition-all duration-500 ease-out"
          style={{ width: `${totalProgress}%` }}
        />
      </div>
      
      <div className="flex flex-wrap gap-1.5">
        {sections.map((section) => (
          <button
            key={section.key}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 ${
              section.completed 
                ? 'bg-foreground/10 text-foreground' 
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
            onClick={() => onSectionClick(section.key)}
          >
            {section.completed ? (
              <Check className="h-2.5 w-2.5" />
            ) : (
              <span className="h-2.5 w-2.5 rounded-full border border-current" />
            )}
            <span>{section.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
