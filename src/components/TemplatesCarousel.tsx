import { useState, Suspense, lazy } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import TemplatePreviewModal from "@/components/templates/TemplatePreviewModal";
import TemplateCustomizationModal from "@/components/templates/TemplateCustomizationModal";
import { TEMPLATE_REGISTRY } from '@/templates/registry';

const ResumeTemplate = lazy(() => import('@/utils/resumeTemplates'));

const mockResumeData = {
  personal: { name: "John Smith", email: "john.smith@email.com", phone: "(555) 123-4567", address: "New York, NY", summary: "Experienced software engineer with 5+ years developing scalable web applications. Passionate about creating efficient solutions and leading development teams.", website: "johndoe.com", linkedin: "linkedin.com/in/johnsmith" },
  experience: [
    { id: 1, title: "Senior Software Engineer", company: "Tech Corp", location: "New York, NY", startDate: "2022-01", endDate: "Present", current: true, description: "Led development of microservices architecture serving 1M+ users. Improved application performance by 40% through optimization." },
    { id: 2, title: "Software Engineer", company: "StartupXYZ", location: "San Francisco, CA", startDate: "2020-03", endDate: "2021-12", current: false, description: "Built responsive web applications using React and Node.js. Implemented automated testing reducing bugs by 60%." }
  ],
  education: [{ id: 1, degree: "Bachelor of Science in Computer Science", school: "University of Technology", field: "Computer Science", location: "Boston, MA", startDate: "2016-08", endDate: "2020-05", description: "GPA: 3.8/4.0" }],
  skills: ["JavaScript", "React", "Node.js", "Python", "AWS"],
  projects: [{ id: 1, title: "E-commerce Platform", description: "Full-stack e-commerce solution with payment integration", technologies: ["React", "Node.js", "MongoDB", "Stripe"], link: "github.com/johnsmith/ecommerce" }],
  customization: { primaryColor: '#2563eb', secondaryColor: '#6b7280', fontSize: 'medium' as const, spacing: 'normal' as const }
};

const TemplatesCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const [customizeKey, setCustomizeKey] = useState<string | null>(null);

  const previewTemplate = previewKey !== null ? TEMPLATE_REGISTRY.find(t => t.key === previewKey) : null;
  const customizeTemplate = customizeKey !== null ? TEMPLATE_REGISTRY.find(t => t.key === customizeKey) : null;

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % TEMPLATE_REGISTRY.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + TEMPLATE_REGISTRY.length) % TEMPLATE_REGISTRY.length);
  const visibleTemplates = 3;
  const maxIndex = Math.max(0, TEMPLATE_REGISTRY.length - visibleTemplates);

  return (
    <section className="apple-section bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-16 md:mb-20">
          <h2 className="apple-headline mb-5">
            Templates that <span className="text-muted-foreground">impress.</span>
          </h2>
          <p className="apple-subheadline mx-auto">
            ATS-friendly, employer-approved designs with real-time preview.
          </p>
        </div>
        
        <div className="relative max-w-5xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-foreground text-background hover:bg-foreground/90 border-0 shadow-lg transition-all"
            onClick={prevSlide}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-foreground text-background hover:bg-foreground/90 border-0 shadow-lg transition-all"
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="overflow-hidden rounded-2xl">
            <div 
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentIndex * (100 / visibleTemplates)}%)` }}
            >
              {TEMPLATE_REGISTRY.map((template) => (
                <div key={template.key} className="w-1/3 flex-shrink-0 px-2.5">
                  <div className="group relative overflow-hidden rounded-2xl bg-[hsl(var(--surface-mid))] border border-border/30 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                    <div className="aspect-[3/4] overflow-hidden cursor-pointer bg-white p-3" onClick={() => setPreviewKey(template.key)}>
                      <div className="h-full w-full bg-white rounded-lg shadow-sm overflow-hidden">
                        <div style={{ transform: 'scale(0.85)', transformOrigin: 'top left', width: '117.6%', height: '117.6%' }}>
                          <Suspense fallback={<div className="w-full h-full bg-muted animate-pulse rounded" />}>
                            <ResumeTemplate data={mockResumeData} templateName={template.key} />
                          </Suspense>
                        </div>
                      </div>
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-[2px]">
                        <Button className="rounded-full px-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg">
                          Preview
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-5 bg-background">
                      <span className="text-xs text-primary font-medium">{template.category}</span>
                      <h3 className="text-sm font-semibold text-foreground mt-1 mb-1 tracking-tight">{template.name}</h3>
                      <p className="text-xs text-muted-foreground mb-4">{template.description}</p>
                      
                      <Button
                        className="w-full rounded-full h-9 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => setCustomizeKey(template.key)}
                      >
                        Use Template
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Minimal dots */}
          <div className="flex justify-center mt-8 gap-1.5">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  currentIndex === index ? 'w-6 bg-foreground' : 'w-1.5 bg-foreground/20 hover:bg-foreground/40'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>
        
        <div className="mt-14 text-center">
          <Link to="/templates" className="apple-link text-base">
            Browse all templates
            <ArrowRight className="h-4 w-4" />
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
            onCustomize={(key) => { setPreviewKey(null); setCustomizeKey(String(key)); }}
          />
        )}
        {customizeTemplate && (
          <TemplateCustomizationModal
            isOpen={!!customizeTemplate}
            onClose={() => setCustomizeKey(null)}
            templateName={customizeTemplate.name}
            onStart={() => { window.location.href = `/resume-builder?template=${customizeTemplate.key}&custom=true`; }}
          />
        )}
      </div>
    </section>
  );
};

export default TemplatesCarousel;

