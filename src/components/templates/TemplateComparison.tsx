import React, { memo } from 'react';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ResumeTemplatePreview } from '@/components/ResumeTemplatePreview';
import { templateNames } from '@/components/resume/ResumeData';
import { ResumeData } from '@/utils/types';

interface TemplateComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  templates: string[];
  currentTemplate: string;
  resume: ResumeData;
  onTemplateSelect: (templateId: string) => void;
}

const TemplateComparisonModal = memo(function TemplateComparisonModal({
  isOpen,
  onClose,
  templates,
  currentTemplate,
  resume,
  onTemplateSelect
}: TemplateComparisonProps) {
  const handleTemplateSelect = (templateId: string) => {
    onTemplateSelect(templateId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Compare Templates
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close template comparison"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {templates.map((templateId) => (
            <Card
              key={templateId}
              className={`relative cursor-pointer transition-all hover:shadow-lg ${
                currentTemplate === templateId
                  ? 'ring-2 ring-primary border-primary'
                  : 'border-border'
              }`}
              onClick={() => handleTemplateSelect(templateId)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleTemplateSelect(templateId);
                }
              }}
              aria-label={`Select ${templateNames[templateId]} template`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {templateNames[templateId]}
                  </CardTitle>
                  {currentTemplate === templateId && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Current
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="w-full h-64 overflow-hidden rounded border">
                  <div className="transform scale-50 origin-top-left" style={{ width: '200%', height: '200%' }}>
                    <ResumeTemplatePreview
                      templateKey={templateId}
                    />
                  </div>
                </div>
                
                <div className="mt-3 text-center">
                  <Button
                    variant={currentTemplate === templateId ? "default" : "outline"}
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTemplateSelect(templateId);
                    }}
                  >
                    {currentTemplate === templateId ? 'Currently Selected' : 'Select Template'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
});

export { TemplateComparisonModal };