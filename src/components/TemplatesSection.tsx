
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const templates = [
  {
    id: 1,
    name: "Modern",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    category: "Professional",
    templateKey: "modern"
  },
  {
    id: 2,
    name: "Classic",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    category: "Traditional",
    templateKey: "classic"
  },
  {
    id: 3,
    name: "Creative",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6", 
    category: "Design",
    templateKey: "creative"
  },
  {
    id: 4,
    name: "Technical",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    category: "Simple",
    templateKey: "technical"
  },
  {
    id: 5,
    name: "Professional",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    category: "Professional",
    templateKey: "professional"
  },
];

const TemplatesSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Professional Resume Templates
          </h2>
          <p className="mt-4 text-xl text-muted-foreground">
            Choose from our collection of professionally designed templates
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((template) => (
            <div key={template.id} className="template-card group">
              <img 
                src={template.image} 
                alt={template.name} 
                className="w-full aspect-[3/4] object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-medium text-foreground">{template.name}</h3>
                <p className="text-sm text-muted-foreground">{template.category}</p>
              </div>
              <div className="template-overlay">
                <Link to={`/resume-builder?template=${template.id}`}>
                  <Button>
                    Use this template
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link to="/templates">
            <Button variant="outline" size="lg" className="group">
              View all templates
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TemplatesSection;
