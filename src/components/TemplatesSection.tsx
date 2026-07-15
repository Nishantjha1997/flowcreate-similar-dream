
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useState } from "react";
import TemplatePreviewModal from "@/components/templates/TemplatePreviewModal";
import TemplateCustomizationModal from "@/components/templates/TemplateCustomizationModal";
import { ResumeTemplatePreview } from '@/components/ResumeTemplatePreview';
import { TEMPLATE_REGISTRY } from '@/templates/registry';

const TemplatesSection = () => {
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const [customizeKey, setCustomizeKey] = useState<string | null>(null);

  const previewTemplate = previewKey !== null ? TEMPLATE_REGISTRY.find(t => t.key === previewKey) : null;
  const customizeTemplate = customizeKey !== null ? TEMPLATE_REGISTRY.find(t => t.key === customizeKey) : null;

  // Render first 6 templates to perfectly fit a 3-column layout
  const displayedTemplates = TEMPLATE_REGISTRY.slice(0, 6);

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Professional Resume Templates
          </h2>
          <p className="mt-4 text-xl text-muted-foreground">
            Choose from our collection of ATS-friendly, employer-approved templates
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {displayedTemplates.map((template) => (
            <div key={template.key} className="group relative overflow-hidden rounded-xl border bg-background shadow-md transition-all duration-300 hover:shadow-xl">
              <div className="aspect-[3/4] overflow-hidden cursor-pointer bg-gray-50" onClick={() => setPreviewKey(template.key)}>
                <ResumeTemplatePreview 
                  templateKey={template.key}
                  className="w-full h-full transform transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <div className="mb-2 flex items-center">
                  <span className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-primary/10 text-primary">
                    {template.category}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground">{template.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{template.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <Link to="/templates">
            <Button variant="outline" size="lg" className="group">
              Browse all templates
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {previewTemplate && (
          <TemplatePreviewModal
            isOpen={!!previewTemplate}
            onClose={() => setPreviewKey(null)}
            template={{
              id: previewTemplate.key,
              name: previewTemplate.name,
              category: previewTemplate.category,
              templateKey: previewTemplate.key,
              description: previewTemplate.description
            }}
            onCustomize={(key) => {
              setPreviewKey(null);
              setCustomizeKey(key);
            }}
          />
        )}
        {customizeTemplate && (
          <TemplateCustomizationModal
            isOpen={!!customizeTemplate}
            onClose={() => setCustomizeKey(null)}
            templateName={customizeTemplate.name}
            onStart={() => {
              window.location.href = `/resume-builder?template=${customizeTemplate.key}&custom=true`;
            }}
          />
        )}
      </div>
    </section>
  );
};

export default TemplatesSection;


