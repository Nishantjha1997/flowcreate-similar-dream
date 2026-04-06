
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useState } from "react";
import TemplatePreviewModal from "@/components/templates/TemplatePreviewModal";
import TemplateCustomizationModal from "@/components/templates/TemplateCustomizationModal";
import { ResumeTemplatePreview } from '@/components/ResumeTemplatePreview';

const templates = [
  { id: 1, name: "Clean Slate", category: "Minimal", templateKey: "clean-slate", description: "Ultra-clean with blue accent — perfect for any industry" },
  { id: 2, name: "Executive Serif", category: "Executive", templateKey: "executive-serif", description: "Prestigious serif for C-level and leadership roles" },
  { id: 3, name: "Sidebar Modern", category: "Creative", templateKey: "sidebar-modern", description: "Purple accent with modern geometric feel" },
  { id: 4, name: "Tech Engineer", category: "Technology", templateKey: "tech-engineer", description: "Dark header, monospace — built for developers" },
  { id: 5, name: "Coral Creative", category: "Creative", templateKey: "coral-creative", description: "Warm coral tones for designers and creatives" },
];

const TemplatesSection = () => {
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [customizeId, setCustomizeId] = useState<number | null>(null);

  const previewTemplate = previewId !== null ? templates.find(t => t.id === previewId) : null;
  const customizeTemplate = customizeId !== null ? templates.find(t => t.id === customizeId) : null;

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
          {templates.map((template) => (
            <div key={template.id} className="group relative overflow-hidden rounded-xl border bg-background shadow-md transition-all duration-300 hover:shadow-xl">
              <div className="aspect-[3/4] overflow-hidden cursor-pointer bg-gray-50" onClick={() => setPreviewId(template.id)}>
                <ResumeTemplatePreview 
                  templateKey={template.templateKey}
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
            onClose={() => setPreviewId(null)}
            template={previewTemplate}
            onCustomize={(id) => {
              setPreviewId(null);
              setCustomizeId(id);
            }}
          />
        )}
        {customizeTemplate && (
          <TemplateCustomizationModal
            isOpen={!!customizeTemplate}
            onClose={() => setCustomizeId(null)}
            templateName={customizeTemplate.name}
            onStart={() => {
              // For now, navigate directly to builder with the template
              window.location.href = `/resume-builder?template=${customizeTemplate.id}&custom=true`;
            }}
          />
        )}
      </div>
    </section>
  );
};

export default TemplatesSection;

