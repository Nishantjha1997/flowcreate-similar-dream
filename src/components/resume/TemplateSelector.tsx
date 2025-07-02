
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ResumeTemplatePreview } from '@/components/ResumeTemplatePreview';

interface TemplateSelectorProps {
  currentTemplateId: string;
  onTemplateChange: (templateId: string) => void;
}

// Comprehensive template list synced with Templates page
const templates = [
  // Professional Templates
  {
    id: "1",
    name: "Executive Modern",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    category: "Professional",
    templateKey: "modern",
    featured: true,
    atsOptimized: true
  },
  {
    id: "2",
    name: "Corporate Classic",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    category: "Professional",
    templateKey: "classic",
    featured: false,
    atsOptimized: true
  },
  {
    id: "3",
    name: "Business Elite",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    category: "Professional",
    templateKey: "professional",
    featured: false,
    atsOptimized: true
  },
  
  // Technology Templates
  {
    id: "4",
    name: "Software Engineer Pro",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    category: "Technology",
    templateKey: "technical",
    featured: true,
    atsOptimized: true
  },
  {
    id: "5",
    name: "DevOps Specialist",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    category: "Technology",
    templateKey: "developer",
    featured: false,
    atsOptimized: true
  },
  {
    id: "6",
    name: "Data Scientist",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    category: "Technology",
    templateKey: "data-scientist",
    featured: true,
    atsOptimized: true
  },
  
  // Creative Templates
  {
    id: "7",
    name: "Creative Portfolio",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6", 
    category: "Creative",
    templateKey: "creative",
    featured: true,
    atsOptimized: false
  },
  {
    id: "8",
    name: "UI/UX Designer",
    image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9",
    category: "Creative",
    templateKey: "elegant",
    featured: false,
    atsOptimized: false
  },
  
  // Healthcare Templates
  {
    id: "10",
    name: "Medical Professional",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56",
    category: "Healthcare",
    templateKey: "medical",
    featured: true,
    atsOptimized: true
  },
  
  // Education Templates
  {
    id: "12",
    name: "Academic Researcher",
    image: "https://images.unsplash.com/photo-1568667256549-094345857637",
    category: "Education",
    templateKey: "academic",
    featured: true,
    atsOptimized: true
  },
  
  // Executive Templates
  {
    id: "19",
    name: "C-Level Executive",
    image: "https://images.unsplash.com/photo-1586281380117-5a60ae2050cc",
    category: "Executive",
    templateKey: "executive",
    featured: true,
    atsOptimized: true
  },
  
  // ATS-Friendly Templates
  {
    id: "21",
    name: "ATS Optimized Pro",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    category: "ATS-Friendly",
    templateKey: "ats-pro",
    featured: true,
    atsOptimized: true
  },
  {
    id: "22",
    name: "Simple & Clean",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    category: "ATS-Friendly",
    templateKey: "compact",
    featured: false,
    atsOptimized: true
  },
  {
    id: "23",
    name: "Minimal ATS",
    image: "https://images.unsplash.com/photo-1586281380117-5a60ae2050cc",
    category: "ATS-Friendly",
    templateKey: "minimalist",
    featured: false,
    atsOptimized: true
  }
];

export const TemplateSelector = ({ currentTemplateId, onTemplateChange }: TemplateSelectorProps) => {
  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Choose Template Style</h3>
        <p className="text-sm text-muted-foreground">Your data will be preserved when switching templates.</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto p-1">
        {templates.map((template) => (
          <div 
            key={template.id}
            className={`cursor-pointer border rounded-md overflow-hidden transition-all hover:shadow-md ${
              currentTemplateId === template.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onTemplateChange(template.id)}
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
              <ResumeTemplatePreview 
                templateKey={template.templateKey}
                className="w-full h-full"
              />
              {currentTemplateId === template.id && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-sm">Current</span>
                </div>
              )}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {template.featured && (
                  <Badge className="text-xs px-1 py-0">Featured</Badge>
                )}
                {template.atsOptimized && (
                  <Badge variant="secondary" className="text-xs px-1 py-0 bg-green-100 text-green-800">ATS</Badge>
                )}
              </div>
            </div>
            <div className="p-2 text-xs font-medium text-center">
              <div className="font-semibold">{template.name}</div>
              <div className="text-muted-foreground text-[10px] mt-0.5">{template.category}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          💡 <strong>ATS-Friendly</strong> templates are optimized to pass Applicant Tracking Systems used by employers.
        </p>
      </div>
    </div>
  );
};
