
import React from 'react';

interface TemplateSelectorProps {
  currentTemplateId: string;
  onTemplateChange: (templateId: string) => void;
}

// Template data synced with the Templates page
const templates = [
  {
    id: 1,
    name: "Modern",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    category: "Professional",
    templateKey: "modern",
    featured: true
  },
  {
    id: 2,
    name: "Classic",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    category: "Traditional",
    templateKey: "classic",
    featured: false
  },
  {
    id: 3,
    name: "Creative",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6", 
    category: "Design",
    templateKey: "creative",
    featured: true
  },
  {
    id: 4,
    name: "Technical",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    category: "Simple",
    templateKey: "technical",
    featured: false
  },
  {
    id: 5,
    name: "Professional",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    category: "Professional",
    templateKey: "professional",
    featured: false
  },
  {
    id: 6,
    name: "Minimalist",
    image: "https://images.unsplash.com/photo-1586281380117-5a60ae2050cc",
    category: "Simple",
    templateKey: "minimalist",
    featured: false
  },
  {
    id: 7,
    name: "Executive",
    image: "https://images.unsplash.com/photo-1586281380117-5a60ae2050cc",
    category: "Executive",
    templateKey: "executive",
    featured: true
  },
  {
    id: 8,
    name: "Elegant",
    image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9",
    category: "Design",
    templateKey: "elegant",
    featured: false
  },
];

export const TemplateSelector = ({ currentTemplateId, onTemplateChange }: TemplateSelectorProps) => {
  return (
    <div className="p-4">
      <p className="text-sm text-muted-foreground mb-3">Choose a template style. Your data will be preserved when switching templates.</p>
      <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1">
        {templates.map((template) => (
          <div 
            key={template.id}
            className={`cursor-pointer border rounded-md overflow-hidden transition-all hover:shadow-md ${
              currentTemplateId === template.id.toString() ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onTemplateChange(template.id.toString())}
          >
            <div className="relative">
              <img 
                src={template.image} 
                alt={`Template ${template.name}`} 
                className="w-full aspect-[3/4] object-cover"
              />
              {currentTemplateId === template.id.toString() && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-sm">Current</span>
                </div>
              )}
              {template.featured && (
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 bg-primary/80 text-primary-foreground text-xs rounded-sm">
                    Featured
                  </span>
                </div>
              )}
            </div>
            <div className="p-2 text-xs font-medium text-center">
              {template.name}
              <p className="text-muted-foreground text-[10px] mt-0.5">{template.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
