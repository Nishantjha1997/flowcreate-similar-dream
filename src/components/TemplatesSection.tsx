
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

const templates = [
  {
    id: 1,
    name: "Modern",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    category: "Professional",
    templateKey: "modern",
    description: "Clean, sleek design with contemporary elements"
  },
  {
    id: 2,
    name: "Classic",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    category: "Traditional",
    templateKey: "classic",
    description: "Traditional layout that stands the test of time"
  },
  {
    id: 3,
    name: "Creative",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6", 
    category: "Design",
    templateKey: "creative",
    description: "Eye-catching design for creative professionals"
  },
  {
    id: 4,
    name: "Technical",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    category: "Simple",
    templateKey: "technical",
    description: "Perfect for tech and engineering fields"
  },
  {
    id: 5,
    name: "Professional",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    category: "Professional",
    templateKey: "professional",
    description: "Polished and refined for executive positions"
  },
];

const TemplatesSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleTemplateSelection = (templateId: number) => {
    if (user) {
      navigate(`/resume-builder?template=${templateId}`);
    } else {
      // Store the intended destination
      sessionStorage.setItem('returnPath', `/resume-builder?template=${templateId}`);
      toast({
        title: "Authentication Required",
        description: "Please log in or create an account to use this template.",
      });
      navigate('/login');
    }
  };

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
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div key={template.id} className="group relative overflow-hidden rounded-lg border bg-background shadow-md transition-all duration-300 hover:shadow-lg">
              <div className="aspect-[3/4] overflow-hidden">
                <img 
                  src={template.image} 
                  alt={template.name} 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-foreground">{template.name}</h3>
                <p className="text-sm text-muted-foreground mb-1">{template.category}</p>
                <p className="text-xs text-muted-foreground">{template.description}</p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <Button 
                  variant="secondary" 
                  className="font-medium"
                  onClick={() => handleTemplateSelection(template.id)}
                >
                  Use this template
                </Button>
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
