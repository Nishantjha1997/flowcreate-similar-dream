
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ResumeTemplatePreview } from '@/components/ResumeTemplatePreview';

interface TemplateSelectorProps {
  currentTemplateId: string;
  onTemplateChange: (templateId: string) => void;
}

const templates = [
  {
    id: "1",
    name: "Clean Slate",
    category: "Minimal",
    templateKey: "clean-slate",
    description: "Ultra-clean with blue accent line",
    atsOptimized: true,
  },
  {
    id: "2",
    name: "Executive Serif",
    category: "Executive",
    templateKey: "executive-serif",
    description: "Prestigious serif for leadership roles",
    atsOptimized: true,
  },
  {
    id: "3",
    name: "Sidebar Modern",
    category: "Creative",
    templateKey: "sidebar-modern",
    description: "Purple accent with rounded elements",
    atsOptimized: true,
  },
  {
    id: "4",
    name: "Tech Engineer",
    category: "Technology",
    templateKey: "tech-engineer",
    description: "Dark header, monospace, dev-focused",
    atsOptimized: true,
  },
  {
    id: "5",
    name: "Coral Creative",
    category: "Creative",
    templateKey: "coral-creative",
    description: "Warm coral for designers & creatives",
    atsOptimized: true,
  },
  {
    id: "6",
    name: "Navy Professional",
    category: "Corporate",
    templateKey: "navy-professional",
    description: "Navy authority for consulting & finance",
    atsOptimized: true,
  },
  {
    id: "7",
    name: "Emerald Minimal",
    category: "Minimal",
    templateKey: "emerald-minimal",
    description: "Emerald tones, generous whitespace",
    atsOptimized: true,
  },
];

export const TemplateSelector = ({ currentTemplateId, onTemplateChange }: TemplateSelectorProps) => {
  return (
    <div className="p-4" data-tour="template-selector">
      <div className="mb-4">
        <h3 className="font-semibold mb-1">Choose Template Style</h3>
        <p className="text-xs text-muted-foreground">All templates are ATS-optimized. Your data is preserved when switching.</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto p-1">
        {templates.map((template) => (
          <div 
            key={template.id}
            className={`cursor-pointer border rounded-lg overflow-hidden transition-all hover:shadow-md group ${
              currentTemplateId === template.id ? 'ring-2 ring-primary shadow-md' : 'hover:border-primary/50'
            }`}
            onClick={() => onTemplateChange(template.id)}
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-muted/30">
              <ResumeTemplatePreview 
                templateKey={template.templateKey}
                className="w-full h-full"
              />
              {currentTemplateId === template.id && (
                <div className="absolute inset-0 bg-primary/15 flex items-center justify-center">
                  <span className="px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-full font-medium shadow-sm">Active</span>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-green-50 text-green-700 border border-green-200">
                  ATS ✓
                </Badge>
              </div>
            </div>
            <div className="p-2.5">
              <div className="text-xs font-semibold">{template.name}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{template.description}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          💡 All 7 templates are <strong>ATS-optimized</strong> and fully customizable with colors, fonts, and section reordering.
        </p>
      </div>
    </div>
  );
};
