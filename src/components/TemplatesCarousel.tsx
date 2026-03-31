import { useState, Suspense, lazy } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import TemplatePreviewModal from "@/components/templates/TemplatePreviewModal";
import TemplateCustomizationModal from "@/components/templates/TemplateCustomizationModal";

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

const templates = [
  { id: 1, name: "Modern Professional", category: "Professional", templateKey: "modern", description: "Clean, contemporary design", image: "/placeholder.svg" },
  { id: 2, name: "Executive Classic", category: "Traditional", templateKey: "classic", description: "Timeless, elegant layout", image: "/placeholder.svg" },
  { id: 3, name: "Creative Portfolio", category: "Design", templateKey: "creative", description: "Eye-catching for creatives", image: "/placeholder.svg" },
  { id: 4, name: "Tech Specialist", category: "Technical", templateKey: "technical", description: "Optimized for tech roles", image: "/placeholder.svg" },
  { id: 5, name: "Corporate Elite", category: "Professional", templateKey: "professional", description: "Refined for executives", image: "/placeholder.svg" }
];

const TemplatesCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [customizeId, setCustomizeId] = useState<number | null>(null);

  const previewTemplate = previewId !== null ? templates.find(t => t.id === previewId) : null;
  const customizeTemplate = customizeId !== null ? templates.find(t => t.id === customizeId) : null;

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % templates.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + templates.length) % templates.length);
  const visibleTemplates = 3;
  const maxIndex = Math.max(0, templates.length - visibleTemplates);

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
            className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-[hsl(var(--surface-dark))] text-white hover:bg-[hsl(var(--surface-dark))]/90 border-0 shadow-lg transition-all"
            onClick={prevSlide}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-[hsl(var(--surface-dark))] text-white hover:bg-[hsl(var(--surface-dark))]/90 border-0 shadow-lg transition-all"
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
              {templates.map((template) => (
                <div key={template.id} className="w-1/3 flex-shrink-0 px-2.5">
                  <div className="group relative overflow-hidden rounded-2xl bg-[hsl(var(--surface-mid))] border border-border/30 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                    <div className="aspect-[3/4] overflow-hidden cursor-pointer bg-white p-3" onClick={() => setPreviewId(template.id)}>
                      <div className="h-full w-full bg-white rounded-lg shadow-sm overflow-hidden">
                        <div style={{ transform: 'scale(0.85)', transformOrigin: 'top left', width: '117.6%', height: '117.6%' }}>
                          <Suspense fallback={<div className="w-full h-full bg-muted animate-pulse rounded" />}>
                            <ResumeTemplate data={mockResumeData} templateName={template.templateKey} />
                          </Suspense>
                        </div>
                      </div>
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-[hsl(var(--surface-dark))]/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-[2px]">
                        <Button className="rounded-full px-6 bg-white text-[hsl(var(--surface-dark))] hover:bg-white/90 shadow-lg">
                          Preview
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-5 bg-background">
                      <span className="text-xs text-primary font-medium">{template.category}</span>
                      <h3 className="text-sm font-semibold text-foreground mt-1 mb-1 tracking-tight">{template.name}</h3>
                      <p className="text-xs text-muted-foreground mb-4">{template.description}</p>
                      
                      <Button
                        className="w-full rounded-full h-9 text-xs font-normal bg-[hsl(var(--surface-dark))] text-white hover:bg-[hsl(var(--surface-dark))]/90"
                        onClick={() => setCustomizeId(template.id)}
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
            onClose={() => setPreviewId(null)}
            template={previewTemplate}
            onCustomize={(id) => { setPreviewId(null); setCustomizeId(id); }}
          />
        )}
        {customizeTemplate && (
          <TemplateCustomizationModal
            isOpen={!!customizeTemplate}
            onClose={() => setCustomizeId(null)}
            templateName={customizeTemplate.name}
            onStart={() => { window.location.href = `/resume-builder?template=${customizeTemplate.id}&custom=true`; }}
          />
        )}
      </div>
    </section>
  );
};

export default TemplatesCarousel;
