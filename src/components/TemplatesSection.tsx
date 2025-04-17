
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const templates = [
  {
    id: 1,
    name: "Modern Professional",
    image: "https://images.unsplash.com/photo-1586281380117-5a60ae2050cc",
    category: "Professional",
    templateKey: "modern",
    description: "Clean, sleek design with contemporary elements"
  },
  {
    id: 2,
    name: "Executive Classic",
    image: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e",
    category: "Traditional",
    templateKey: "classic",
    description: "Traditional layout that stands the test of time"
  },
  {
    id: 3,
    name: "Creative Portfolio",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d", 
    category: "Design",
    templateKey: "creative",
    description: "Eye-catching design for creative professionals"
  },
  {
    id: 4,
    name: "Tech Specialist",
    image: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613",
    category: "Technical",
    templateKey: "technical",
    description: "Optimized for tech and engineering fields"
  },
  {
    id: 5,
    name: "Corporate Elite",
    image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e",
    category: "Professional",
    templateKey: "professional",
    description: "Polished and refined for executive positions"
  },
];

const TemplatesSection = () => {
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
              <div className="aspect-[3/4] overflow-hidden">
                <img 
                  src={template.image} 
                  alt={template.name} 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
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
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <Link to={`/resume-builder?template=${template.id}`}>
                  <Button variant="default" className="font-medium">
                    Use this template
                  </Button>
                </Link>
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
      </div>
    </section>
  );
};

export default TemplatesSection;
