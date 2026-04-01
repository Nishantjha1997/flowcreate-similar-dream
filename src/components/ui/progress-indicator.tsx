import { Check, Circle } from 'lucide-react';
import { ResumeData } from '@/utils/types';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  resume: ResumeData;
  onSectionClick: (section: string) => void;
}

interface SectionStatus {
  name: string;
  key: string;
  completed: boolean;
}

export function ProgressIndicator({ resume, onSectionClick }: ProgressIndicatorProps) {
  const sections: SectionStatus[] = [
    { name: 'Personal', key: 'personal', completed: !!(resume.personal?.name && resume.personal?.email) },
    { name: 'Experience', key: 'experience', completed: !!(resume.experience?.length > 0) },
    { name: 'Education', key: 'education', completed: !!(resume.education?.length > 0) },
    { name: 'Skills', key: 'skills', completed: !!(resume.skills?.length > 0) },
    { name: 'Projects', key: 'projects', completed: !!(resume.projects?.length > 0) },
  ];

  const completedCount = sections.filter(s => s.completed).length;
  const totalProgress = (completedCount / sections.length) * 100;

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
      {/* Progress header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground tracking-tight">{completedCount}/{sections.length} Complete</span>
        </div>
        <span className={cn(
          "text-[11px] font-bold tabular-nums px-2 py-0.5 rounded-full",
          totalProgress === 100
            ? "bg-green-500/10 text-green-600"
            : "bg-muted text-muted-foreground"
        )}>
          {Math.round(totalProgress)}%
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="h-1.5 bg-muted/60 rounded-full overflow-hidden mb-3">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            totalProgress === 100 ? "bg-green-500" : "bg-foreground"
          )}
          style={{ width: `${totalProgress}%` }}
        />
      </div>
      
      {/* Section steps – horizontal stepper */}
      <div className="flex items-center gap-1">
        {sections.map((section, i) => (
          <button
            key={section.key}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-1.5 rounded-lg transition-all duration-200 group",
              "hover:bg-muted/60"
            )}
            onClick={() => onSectionClick(section.key)}
          >
            <div className={cn(
              "h-5 w-5 rounded-full flex items-center justify-center transition-all duration-300",
              section.completed
                ? "bg-foreground text-background scale-100"
                : "border-2 border-muted-foreground/30 group-hover:border-foreground/50"
            )}>
              {section.completed ? (
                <Check className="h-3 w-3" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 group-hover:bg-foreground/50 transition-colors" />
              )}
            </div>
            <span className={cn(
              "text-[10px] font-medium transition-colors",
              section.completed ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
            )}>
              {section.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
