import { useState, Suspense, lazy } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import TemplatePreviewModal from "@/components/templates/TemplatePreviewModal";
import TemplateCustomizationModal from "@/components/templates/TemplateCustomizationModal";
import { TemplatesSkeleton } from '@/components/ui/template-skeleton';

// Lazy load the heavy ResumeTemplate component
const ResumeTemplate = lazy(() => import('@/utils/resumeTemplates'));

// Mock resume data to show in templates
const mockResumeData = {
  personal: {
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "(555) 123-4567",
    address: "New York, NY",
    summary: "Experienced software engineer with 5+ years developing scalable web applications. Passionate about creating efficient solutions and leading development teams.",
    website: "johndoe.com",
    linkedin: "linkedin.com/in/johnsmith"
  },
  experience: [
    {
      id: 1,
      title: "Senior Software Engineer",
      company: "Tech Corp",
      location: "New York, NY",
      startDate: "2022-01",
      endDate: "Present",
      current: true,
      description: "Led development of microservices architecture serving 1M+ users. Improved application performance by 40% through optimization. Mentored junior developers and conducted code reviews."
    },
    {
      id: 2,
      title: "Software Engineer",
      company: "StartupXYZ",
      location: "San Francisco, CA",
      startDate: "2020-03",
      endDate: "2021-12",
      current: false,
      description: "Built responsive web applications using React and Node.js. Collaborated with cross-functional teams to deliver features. Implemented automated testing reducing bugs by 60%."
    }
  ],
  education: [
    {
      id: 1,
      degree: "Bachelor of Science in Computer Science",
      school: "University of Technology",
      field: "Computer Science",
      location: "Boston, MA",
      startDate: "2016-08",
      endDate: "2020-05",
      description: "GPA: 3.8/4.0"
    }
  ],
  skills: ["JavaScript", "React", "Node.js", "Python", "AWS"],
  projects: [
    {
      id: 1,
      title: "E-commerce Platform",
      description: "Full-stack e-commerce solution with payment integration",
      technologies: ["React", "Node.js", "MongoDB", "Stripe"],
      link: "github.com/johnsmith/ecommerce"
    }
  ],
  customization: {
    primaryColor: '#2563eb',
    secondaryColor: '#6b7280',
    fontSize: 'medium' as const,
    spacing: 'normal' as const
  }
};

const templates = [
  {
    id: 1,
    name: "Modern Professional",
    category: "Professional",
    templateKey: "modern",
    description: "Clean, sleek design with contemporary elements",
    image: "/placeholder.svg"
  },
  {
    id: 2,
    name: "Executive Classic",
    category: "Traditional",
    templateKey: "classic",
    description: "Traditional layout that stands the test of time",
    image: "/placeholder.svg"
  },
  {
    id: 3,
    name: "Creative Portfolio",
    category: "Design",
    templateKey: "creative",
    description: "Eye-catching design for creative professionals",
    image: "/placeholder.svg"
  },
  {
    id: 4,
    name: "Tech Specialist",
    category: "Technical",
    templateKey: "technical",
    description: "Optimized for tech and engineering fields",
    image: "/placeholder.svg"
  },
  {
    id: 5,
    name: "Corporate Elite",
    category: "Professional",
    templateKey: "professional",
    description: "Polished and refined for executive positions",
    image: "/placeholder.svg"
  }
];

const TemplatesCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [customizeId, setCustomizeId] = useState<number | null>(null);

  const previewTemplate = previewId !== null ? templates.find(t => t.id === previewId) : null;
  const customizeTemplate = customizeId !== null ? templates.find(t => t.id === customizeId) : null;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % templates.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + templates.length) % templates.length);
  };

  const visibleTemplates = 3;
  const maxIndex = Math.max(0, templates.length - visibleTemplates);

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
            Choose from our collection of ATS-friendly, employer-approved templates with real-time preview
          </p>
        </div>
        
        <div className="relative max-w-6xl mx-auto">
          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border-2 shadow-lg hover:bg-background"
            onClick={prevSlide}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border-2 shadow-lg hover:bg-background"
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Templates Carousel */}
          <div className="overflow-hidden rounded-xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / visibleTemplates)}%)` }}
            >
              {templates.map((template) => (
                <div key={template.id} className="w-1/3 flex-shrink-0 px-3">
                  <div className="group relative overflow-hidden rounded-xl border bg-background/60 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
                    <div className="aspect-[3/4] overflow-hidden cursor-pointer bg-white p-2" onClick={() => setPreviewId(template.id)}>
                      {/* Live Resume Template Preview with better scaling */}
                      <div className="h-full w-full bg-white rounded shadow-sm overflow-hidden">
                        <div style={{ transform: 'scale(0.85)', transformOrigin: 'top left', width: '117.6%', height: '117.6%' }}>
                          <Suspense fallback={<div className="w-full h-full bg-gray-100 animate-pulse rounded" />}>
                            <ResumeTemplate 
                              data={mockResumeData} 
                              templateName={template.templateKey}
                            />
                          </Suspense>
                        </div>
                      </div>
                      
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
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
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
