
import { useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import TemplatePreviewModal from "@/components/templates/TemplatePreviewModal";
import TemplateCustomizationModal from "@/components/templates/TemplateCustomizationModal";

const templates = [
  {
    id: 1,
    name: "Modern Professional",
    image: "https://images.unsplash.com/photo-1586281380117-5a60ae2050cc",
    category: "Professional",
    templateKey: "modern",
    description: "Clean, sleek design with contemporary elements",
    preview: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEwIiBoZWlnaHQ9IjI5NyIgdmlld0JveD0iMCAwIDIxMCAyOTciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIxMCIgaGVpZ2h0PSIyOTciIGZpbGw9IndoaXRlIi8+PHJlY3QgeD0iMjAiIHk9IjIwIiB3aWR0aD0iMTcwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMzMzIi8+PHJlY3QgeD0iMjAiIHk9IjgwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE1IiBmaWxsPSIjNjY2Ii8+PHJlY3QgeD0iMjAiIHk9IjExMCIgd2lkdGg9IjE3MCIgaGVpZ2h0PSIyIiBmaWxsPSIjY2NjIi8+PHJlY3QgeD0iMjAiIHk9IjEzMCIgd2lkdGg9IjE3MCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzMzMyIvPjxyZWN0IHg9IjIwIiB5PSIxNTAiIHdpZHRoPSIxNjAiIGhlaWdodD0iOCIgZmlsbD0iIzk5OSIvPjwvc3ZnPg=="
  },
  {
    id: 2,
    name: "Executive Classic",
    image: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e",
    category: "Traditional",
    templateKey: "classic",
    description: "Traditional layout that stands the test of time",
    preview: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEwIiBoZWlnaHQ9IjI5NyIgdmlld0JveD0iMCAwIDIxMCAyOTciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIxMCIgaGVpZ2h0PSIyOTciIGZpbGw9IndoaXRlIi8+PHJlY3QgeD0iMjAiIHk9IjIwIiB3aWR0aD0iMTcwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjMjIyIi8+PHJlY3QgeD0iMjAiIHk9IjYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEyIiBmaWxsPSIjNTU1Ii8+PHJlY3QgeD0iMjAiIHk9IjkwIiB3aWR0aD0iMTcwIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiLz48cmVjdCB4PSIyMCIgeT0iMTEwIiB3aWR0aD0iMTcwIiBoZWlnaHQ9IjE1IiBmaWxsPSIjMjIyIi8+PHJlY3QgeD0iMjAiIHk9IjEzNSIgd2lkdGg9IjE1MCIgaGVpZ2h0PSI4IiBmaWxsPSIjNzc3Ii8+PC9zdmc+"
  },
  {
    id: 3,
    name: "Creative Portfolio",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d",
    category: "Design",
    templateKey: "creative",
    description: "Eye-catching design for creative professionals",
    preview: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEwIiBoZWlnaHQ9IjI5NyIgdmlld0JveD0iMCAwIDIxMCAyOTciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIxMCIgaGVpZ2h0PSIyOTciIGZpbGw9IndoaXRlIi8+PHJlY3QgeD0iMjAiIHk9IjIwIiB3aWR0aD0iNjAiIGhlaWdodD0iMjU3IiBmaWxsPSIjZjMxMjYwIi8+PHJlY3QgeD0iMTAwIiB5PSIyMCIgd2lkdGg9IjkwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjMzMzIi8+PHJlY3QgeD0iMTAwIiB5PSI2MCIgd2lkdGg9IjcwIiBoZWlnaHQ9IjEyIiBmaWxsPSIjNjY2Ii8+PHJlY3QgeD0iMTAwIiB5PSI5MCIgd2lkdGg9IjkwIiBoZWlnaHQ9IjE1IiBmaWxsPSIjMzMzIi8+PC9zdmc+"
  },
  {
    id: 4,
    name: "Tech Specialist",
    image: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613",
    category: "Technical",
    templateKey: "technical",
    description: "Optimized for tech and engineering fields",
    preview: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEwIiBoZWlnaHQ9IjI5NyIgdmlld0JveD0iMCAwIDIxMCAyOTciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIxMCIgaGVpZ2h0PSIyOTciIGZpbGw9IiNmOWZhZmIiLz48cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSIxNzAiIGhlaWdodD0iMjUiIGZpbGw9IiMxMTFhMjciLz48cmVjdCB4PSIyMCIgeT0iNjAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAiIGZpbGw9IiM0YjViNjkiLz48cmVjdCB4PSIyMCIgeT0iOTAiIHdpZHRoPSIxNzAiIGhlaWdodD0iMTIiIGZpbGw9IiMxMTFhMjciLz48cmVjdCB4PSIyMCIgeT0iMTEwIiB3aWR0aD0iMTQwIiBoZWlnaHQ9IjgiIGZpbGw9IiM2YjczODAiLz48L3N2Zz4="
  },
  {
    id: 5,
    name: "Corporate Elite",
    image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e",
    category: "Professional",
    templateKey: "professional",
    description: "Polished and refined for executive positions",
    preview: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEwIiBoZWlnaHQ9IjI5NyIgdmlld0JveD0iMCAwIDIxMCAyOTciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIxMCIgaGVpZ2h0PSIyOTciIGZpbGw9IndoaXRlIi8+PHJlY3QgeD0iMjAiIHk9IjIwIiB3aWR0aD0iMTcwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjMWY0ZTc5Ii8+PHJlY3QgeD0iMjAiIHk9IjkwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyIiBmaWxsPSIjMzc0MTUxIi8+PHJlY3QgeD0iMjAiIHk9IjEyMCIgd2lkdGg9IjE3MCIgaGVpZ2h0PSIxNSIgZmlsbD0iIzFmNGU3OSIvPjxyZWN0IHg9IjIwIiB5PSIxNDUiIHdpZHRoPSIxNTAiIGhlaWdodD0iOCIgZmlsbD0iIzZiNzI4MCIvPjwvc3ZnPg=="
  },
];

const TemplatesCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [customizeId, setCustomizeId] = useState<number | null>(null);

  const previewTemplate = previewId !== null ? templates.find(t => t.id === previewId) : null;
  const customizeTemplate = customizeId !== null ? templates.find(t => t.id === customizeId) : null;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, templates.length - 2));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, templates.length - 2)) % Math.max(1, templates.length - 2));
  };

  return (
    <section className="py-24 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23000000" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          backgroundSize: '30px 30px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            Professional Resume Templates
          </h2>
          <p className="text-xl text-muted-foreground">
            Choose from our collection of ATS-friendly, employer-approved templates
          </p>
        </div>
        
        <div className="relative max-w-6xl mx-auto">
          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border-2 shadow-lg hover:bg-background"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border-2 shadow-lg hover:bg-background"
            onClick={nextSlide}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Templates Carousel */}
          <div className="overflow-hidden rounded-xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 33.333}%)` }}
            >
              {templates.map((template) => (
                <div key={template.id} className="w-1/3 flex-shrink-0 px-3">
                  <div className="group relative overflow-hidden rounded-xl border bg-background/60 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
                    <div className="aspect-[3/4] overflow-hidden cursor-pointer bg-gradient-to-br from-muted/50 to-muted/20" onClick={() => setPreviewId(template.id)}>
                      {template.preview ? (
                        <img 
                          src={template.preview} 
                          alt={`${template.name} preview`} 
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                          <span className="text-muted-foreground">Preview</span>
                        </div>
                      )}
                      
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button className="bg-white text-black hover:bg-gray-100">
                          Preview Template
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-background/80 backdrop-blur-sm">
                      <div className="mb-3 flex items-center">
                        <span className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-primary/10 text-primary">
                          {template.category}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                      
                      <Button
                        className="w-full"
                        onClick={() => setCustomizeId(template.id)}
                      >
                        Use This Template
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: Math.max(1, templates.length - 2) }).map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentIndex === index ? 'bg-primary scale-125' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <Link to="/templates">
            <Button variant="outline" size="lg" className="group bg-background/60 backdrop-blur-sm border-2">
              Browse all templates
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Modals */}
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
              window.location.href = `/resume-builder?template=${customizeTemplate.id}&custom=true`;
            }}
          />
        )}
      </div>
    </section>
  );
};

export default TemplatesCarousel;
