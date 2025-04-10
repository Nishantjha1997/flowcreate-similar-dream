
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search, Star, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ResumeData } from '@/utils/resumeAdapterUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const templates = [
  {
    id: 1,
    name: "Modern",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    category: "Professional",
    templateKey: "modern",
    featured: true,
    popular: true,
    description: "Clean and professional template with a modern layout, perfect for tech and corporate roles."
  },
  {
    id: 2,
    name: "Classic",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    category: "Traditional",
    templateKey: "classic",
    featured: false,
    popular: true,
    description: "Timeless design with traditional formatting, suitable for all industries and experience levels."
  },
  {
    id: 3,
    name: "Creative",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6", 
    category: "Design",
    templateKey: "creative",
    featured: true,
    popular: false,
    description: "Bold and eye-catching layout for creative professionals looking to stand out."
  },
  {
    id: 4,
    name: "Technical",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    category: "Simple",
    templateKey: "technical",
    featured: false,
    popular: false,
    description: "Focused on technical skills with dedicated sections for projects and expertise."
  },
  {
    id: 5,
    name: "Professional",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    category: "Professional",
    templateKey: "professional",
    featured: false,
    popular: true,
    description: "Balanced and versatile template for professionals in any field."
  },
  {
    id: 6,
    name: "Executive",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    category: "Executive",
    templateKey: "executive",
    featured: true,
    popular: false,
    description: "Sophisticated design for senior managers and executives highlighting leadership experience."
  },
  {
    id: 7,
    name: "Compact",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    category: "Simple",
    templateKey: "compact",
    featured: false,
    popular: false,
    description: "Space-efficient layout that maximizes content while maintaining readability."
  },
  {
    id: 8,
    name: "Elegant",
    image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9",
    category: "Design",
    templateKey: "elegant",
    featured: false,
    popular: true,
    description: "Refined and elegant design with sophisticated typography and layout."
  },
];

const categories = ["All", "Professional", "Traditional", "Design", "Simple", "Executive"];

const Templates = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredTemplates = templates.filter((template) => {
    // Filter by tab
    if (activeTab === "featured" && !template.featured) return false;
    if (activeTab === "popular" && !template.popular) return false;
    
    // Filter by category
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
    
    // Filter by search
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchQuery.toLowerCase());
                          
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

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <TabsList>
                <TabsTrigger value="all">All Templates</TabsTrigger>
                <TabsTrigger value="featured">
                  <Star className="h-4 w-4 mr-1" /> Featured
                </TabsTrigger>
                <TabsTrigger value="popular">
                  <CheckCircle className="h-4 w-4 mr-1" /> Most Popular
                </TabsTrigger>
              </TabsList>
              
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
          </Tabs>

          <div className="mb-8 flex overflow-x-auto py-2 space-x-2">
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
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg template-card group">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img 
                    src={template.image} 
                    alt={template.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {template.featured && (
                    <Badge className="absolute top-3 left-3 bg-primary">Featured</Badge>
                  )}
                  {template.popular && (
                    <Badge variant="secondary" className="absolute top-3 right-3">Popular</Badge>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.category}</p>
                  </div>
                  
                  <p className="text-sm mb-4 text-muted-foreground">{template.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Link to={`/resume-builder?template=${template.id}`}>
                      <Button variant="outline" className="w-full">Preview</Button>
                    </Link>
                    <Link to={`/resume-builder?template=${template.id}&example=true`}>
                      <Button className="w-full">Use Template</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
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
