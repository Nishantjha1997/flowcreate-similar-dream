
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const templates = [
  {
    id: 1,
    name: "Modern",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    category: "Professional"
  },
  {
    id: 2,
    name: "Classic",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    category: "Traditional"
  },
  {
    id: 3,
    name: "Creative",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6", 
    category: "Design"
  },
  {
    id: 4,
    name: "Minimal",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    category: "Simple"
  },
  {
    id: 5,
    name: "Executive",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    category: "Professional"
  },
  {
    id: 6,
    name: "Contemporary",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    category: "Modern"
  },
  {
    id: 7,
    name: "Technical",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    category: "Professional"
  },
  {
    id: 8,
    name: "Elegant",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    category: "Traditional"
  },
];

const categories = ["All", "Professional", "Traditional", "Modern", "Design", "Simple"];

const Templates = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Resume Templates
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Choose from our collection of professionally designed templates
            </p>
          </div>

          <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex overflow-x-auto py-2 space-x-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>
            
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search templates..."
                className="pl-10 min-w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredTemplates.map((template) => (
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
          
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No templates found matching your criteria.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Templates;
