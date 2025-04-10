
import React from 'react';

interface TemplateSelectorProps {
  currentTemplateId: string;
  onTemplateChange: (templateId: string) => void;
}

export const TemplateSelector = ({ currentTemplateId, onTemplateChange }: TemplateSelectorProps) => {
  return (
    <div className="p-4">
      <p className="text-sm text-muted-foreground mb-3">Choose a template style. Your data will be preserved when switching templates.</p>
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4, 5, 6, 7].map((id) => (
          <div 
            key={id}
            className={`cursor-pointer border rounded-md overflow-hidden transition-all hover:shadow-md ${
              currentTemplateId === id.toString() ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onTemplateChange(id.toString())}
          >
            <div className="relative">
              <img 
                src={`https://images.unsplash.com/photo-${id <= 5 ? '1461749280684-dccba630e2f6' : '1586281380117-5a60ae2050cc'}`} 
                alt={`Template ${id}`} 
                className="w-full aspect-[3/4] object-cover"
              />
              {currentTemplateId === id.toString() && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-sm">Current</span>
                </div>
              )}
            </div>
            <div className="p-2 text-xs font-medium text-center">
              {id === 1 && "Modern"}
              {id === 2 && "Classic"}
              {id === 3 && "Creative"}
              {id === 4 && "Technical"}
              {id === 5 && "Professional"}
              {id === 6 && "Minimalist"}
              {id === 7 && "Executive"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
