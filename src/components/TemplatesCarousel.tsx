import { useState, useMemo } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, CheckCircle2, Award, Zap, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import TemplatePreviewModal from '@/components/templates/TemplatePreviewModal';
import { ResumeTemplatePreview } from '@/components/ResumeTemplatePreview';
import { TEMPLATE_REGISTRY, TemplateDefinition } from '@/templates/registry';
import { useDesignMode } from '@/hooks/useDesignMode';

// Color themes for live preview toggling
const COLOR_ACCENTS = [
  { label: 'Navy Blue', hex: '#2563eb' },
  { label: 'Emerald Green', hex: '#059669' },
  { label: 'Royal Violet', hex: '#7c3aed' },
  { label: 'Slate Charcoal', hex: '#1e293b' },
  { label: 'Terracotta Amber', hex: '#ea580c' },
  { label: 'Crimson Red', hex: '#dc2626' },
];

const CATEGORY_TABS = [
  { id: 'all', label: 'All Templates' },
  { id: 'popular', label: '🔥 Most Popular' },
  { id: 'ats', label: '🛡️ 100% ATS Clean' },
  { id: 'executive', label: '💼 Executive & Leadership' },
  { id: 'tech', label: '⚡ Tech & Engineering' },
  { id: 'creative', label: '🎨 Creative & Design' },
];

export default function TemplatesCarousel() {
  const { isNeoBrutalism } = useDesignMode();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedAccent, setSelectedAccent] = useState(COLOR_ACCENTS[0].hex);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previewKey, setPreviewKey] = useState<string | null>(null);

  // Filter templates based on active category
  const filteredTemplates = useMemo(() => {
    return TEMPLATE_REGISTRY.filter((template) => {
      if (activeCategory === 'popular') {
        return ['split-frame', 'modern', 'bold-headline', 'atlantic-blue', 'executive-serif', 'timeline-dot'].includes(template.key);
      }
      if (activeCategory === 'ats') {
        return template.atsOptimized || ['compact-ats', 'precision-line', 'clean-slate', 'emerald-minimal'].includes(template.key);
      }
      if (activeCategory === 'executive') {
        return template.category === 'Executive' || ['executive-serif', 'editorial-rule', 'steady-form', 'elegant-contrast', 'ink-serif'].includes(template.key);
      }
      if (activeCategory === 'tech') {
        return template.category === 'Technology' || ['tech-engineer', 'blue-neon', 'swiss-grid', 'mercury-flow'].includes(template.key);
      }
      if (activeCategory === 'creative') {
        return template.category === 'Creative' || ['header-band', 'warm-humanist', 'hunter-green', 'coral-creative'].includes(template.key);
      }
      return true;
    });
  }, [activeCategory]);

  const visibleCount = 3;
  const maxIndex = Math.max(0, filteredTemplates.length - visibleCount);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    setCurrentIndex(0);
  };

  const handleUseTemplate = (templateKey: string) => {
    navigate(`/resume-builder?template=${templateKey}`);
  };

  const previewTemplate = previewKey ? TEMPLATE_REGISTRY.find((t) => t.key === previewKey) : null;

  return (
    <section className="py-20 md:py-28 bg-muted/20 border-b border-border/40">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="h-3.5 w-3.5" /> Recruiter-Approved Layouts
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
            Proven Templates Designed to Win Interviews
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Engineered with certified recruiters to pass all ATS scanners (Workday, Greenhouse, Taleo).
            Select a template, customize accent colors, and start creating immediately.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleCategoryChange(tab.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-foreground text-background shadow-md'
                    : 'bg-background border border-border/70 text-muted-foreground hover:text-foreground hover:border-foreground/30'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Color Palette Switcher Bar */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1">
            Preview Accent:
          </span>
          <div className="flex items-center gap-2 p-1.5 rounded-full bg-background border border-border/70 shadow-sm">
            {COLOR_ACCENTS.map((color) => (
              <button
                key={color.hex}
                type="button"
                title={color.label}
                onClick={() => setSelectedAccent(color.hex)}
                className={`h-6 w-6 rounded-full transition-transform duration-200 ${
                  selectedAccent === color.hex ? 'scale-125 ring-2 ring-foreground ring-offset-2' : 'hover:scale-110 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-12">
          {/* Navigation Controls */}
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-background/90 backdrop-blur-md shadow-lg border-border hover:bg-background disabled:opacity-30 transition-all hidden sm:flex"
            aria-label="Previous template slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex >= maxIndex}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-background/90 backdrop-blur-md shadow-lg border-border hover:bg-background disabled:opacity-30 transition-all hidden sm:flex"
            aria-label="Next template slide"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Cards Track */}
          <div className="overflow-hidden py-4">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / (window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3))}%)`,
              }}
            >
              {filteredTemplates.map((template) => {
                return (
                  <div
                    key={template.key}
                    className="w-full sm:w-1/2 lg:w-1/3 flex-shrink-0 px-3.5"
                  >
                    <div className="group relative rounded-2xl bg-background border border-border/80 shadow-md hover:shadow-2xl hover:border-primary/50 transition-all duration-300 overflow-hidden flex flex-col h-full">
                      {/* Card Preview Header / Visual */}
                      <div className="relative aspect-[3/4] bg-muted/40 p-4 overflow-hidden border-b border-border/50">
                        {/* Live rendered preview */}
                        <div className="h-full w-full rounded-lg overflow-hidden shadow-sm bg-white transition-transform duration-500 group-hover:scale-[1.03]">
                          <ResumeTemplatePreview
                            templateKey={template.key}
                            primaryColor={selectedAccent}
                            className="w-full h-full"
                          />
                        </div>

                        {/* Top Badges */}
                        <div className="absolute top-6 left-6 flex flex-col gap-1.5 z-10 pointer-events-none">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-background/90 backdrop-blur-md border border-border/70 text-foreground shadow-sm">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            {template.atsOptimized ? 'ATS Certified' : 'Modern Layout'}
                          </span>
                        </div>

                        {/* Hover Quick Action Overlay */}
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 p-6 z-20">
                          <Button
                            size="sm"
                            className="w-full rounded-full font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                            onClick={() => handleUseTemplate(template.key)}
                          >
                            Use This Template <ArrowRight className="ml-1.5 h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="w-full rounded-full font-medium bg-background/90 text-foreground hover:bg-background shadow-md"
                            onClick={() => setPreviewKey(template.key)}
                          >
                            <Eye className="mr-1.5 h-4 w-4" /> Full Preview
                          </Button>
                        </div>
                      </div>

                      {/* Card Footer Metadata */}
                      <div className="p-5 flex flex-col justify-between flex-grow">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                              {template.category}
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground">
                              {template.layout === 'sidebar-left' || template.layout === 'sidebar-right'
                                ? 'Two Column'
                                : 'Single Column'}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-foreground mb-1 tracking-tight">
                            {template.name}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                            {template.description}
                          </p>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full rounded-full text-xs font-semibold group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors"
                          onClick={() => handleUseTemplate(template.key)}
                        >
                          Use Template <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Pagination Indicators */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Call to Action */}
        <div className="mt-12 text-center">
          <Link to="/templates">
            <Button size="lg" variant="outline" className="rounded-full px-8 font-semibold shadow-sm hover:border-primary">
              Browse All 30+ ATS Templates <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground mt-3">
            💡 Pro Tip: You can switch templates anytime in the editor without re-typing your resume.
          </p>
        </div>
      </div>

      {/* Full Resolution Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={{
            id: previewTemplate.key,
            name: previewTemplate.name,
            description: previewTemplate.description,
            category: previewTemplate.category,
            templateKey: previewTemplate.key,
          }}
          isOpen={true}
          onClose={() => setPreviewKey(null)}
          onCustomize={() => {
            handleUseTemplate(previewTemplate.key);
            setPreviewKey(null);
          }}
        />
      )}
    </section>
  );
}
