
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search, Star, CheckCircle, Award, Briefcase, Code, Palette, Building2, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResumeTemplatePreview } from '@/components/ResumeTemplatePreview';

const templates = [
  {
    id: 1, name: "Clean Slate", category: "Minimal", templateKey: "clean-slate",
    featured: true, popular: true, atsOptimized: true,
    description: "Ultra-clean single-column layout with blue accent line. Maximum whitespace, perfect for any industry."
  },
  {
    id: 2, name: "Executive Serif", category: "Executive", templateKey: "executive-serif",
    featured: true, popular: true, atsOptimized: true,
    description: "Prestigious serif typography with centered header and double-border. Ideal for C-level and senior leadership."
  },
  {
    id: 3, name: "Sidebar Modern", category: "Creative", templateKey: "sidebar-modern",
    featured: true, popular: true, atsOptimized: true,
    description: "Bold purple accent bar with rounded skill badges and geometric feel. Great for marketing and branding roles."
  },
  {
    id: 4, name: "Tech Engineer", category: "Technology", templateKey: "tech-engineer",
    featured: true, popular: true, atsOptimized: true,
    description: "Dark header band with monospace font and cyan accents. Built for developers, DevOps, and engineers."
  },
  {
    id: 5, name: "Coral Creative", category: "Creative", templateKey: "coral-creative",
    featured: true, popular: false, atsOptimized: true,
    description: "Warm coral/rose tones with rounded elements and creative left-border items. Perfect for designers."
  },
  {
    id: 6, name: "Navy Professional", category: "Corporate", templateKey: "navy-professional",
    featured: true, popular: true, atsOptimized: true,
    description: "Navy authority with strong borders and filled skill badges. For finance, consulting, and management."
  },
  {
    id: 7, name: "Emerald Minimal", category: "Minimal", templateKey: "emerald-minimal",
    featured: true, popular: false, atsOptimized: true,
    description: "Earthy emerald/teal tones with generous whitespace. Great for healthcare, education, and sustainability."
  },
];

const categories = ["All", "Minimal", "Executive", "Creative", "Technology", "Corporate"];

const Templates = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredTemplates = templates.filter((template) => {
    // Filter by tab
    if (activeTab === "featured" && !template.featured) return false;
    if (activeTab === "popular" && !template.popular) return false;
    if (activeTab === "ats" && !template.atsOptimized) return false;
    
    // Filter by category
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
    
    // Filter by search
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchQuery.toLowerCase());
                          
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[hsl(var(--surface-elevated))]">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="apple-headline-lg mb-4">
              Resume Templates
            </h1>
            <p className="apple-subheadline mx-auto">
              Choose from {templates.length}+ professionally designed templates for every industry.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                ATS-Optimized Available
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                Industry-Specific
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Professional Designs
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <TabsList className="grid w-full max-w-md grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="featured">
                  <Star className="h-4 w-4 mr-1" /> Featured
                </TabsTrigger>
                <TabsTrigger value="popular">
                  <CheckCircle className="h-4 w-4 mr-1" /> Popular
                </TabsTrigger>
                <TabsTrigger value="ats">
                  <Award className="h-4 w-4 mr-1" /> ATS
                </TabsTrigger>
              </TabsList>
              
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search templates..."
                  className="pl-10 min-w-[300px]"
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
                {category === "Technology" && <Code className="h-4 w-4 mr-1" />}
                {category === "Creative" && <Palette className="h-4 w-4 mr-1" />}
                {category === "Executive" && <Building2 className="h-4 w-4 mr-1" />}
                {category === "Corporate" && <Briefcase className="h-4 w-4 mr-1" />}
                {category}
              </Button>
            ))}
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="overflow-hidden h-full transition-all duration-500 hover:shadow-xl hover:-translate-y-1 rounded-2xl border border-border/40 bg-background group">
                <div className="relative aspect-[3/4] overflow-hidden bg-muted/50">
                  <ResumeTemplatePreview 
                    templateKey={template.templateKey}
                    className="w-full h-full transform transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {template.featured && (
                      <Badge className="bg-primary">Featured</Badge>
                    )}
                    {template.atsOptimized && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">ATS-Friendly</Badge>
                    )}
                  </div>
                  {template.popular && (
                    <Badge variant="secondary" className="absolute top-3 right-3">Popular</Badge>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.category}</p>
                  </div>
                  
                  <p className="text-sm mb-4 text-muted-foreground line-clamp-2">{template.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Link to={`/resume-builder?template=${template.id}`}>
                      <Button variant="outline" className="w-full text-xs">Preview</Button>
                    </Link>
                    <Link to={`/resume-builder?template=${template.id}&example=true`}>
                      <Button className="w-full text-xs">Use Template</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No templates found matching your criteria.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setActiveTab("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}

          <div className="mt-20 rounded-3xl bg-[hsl(var(--surface-dark))] p-12 md:p-16 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4 text-[hsl(var(--surface-dark-foreground))]">Can't find the perfect template?</h2>
            <p className="text-[hsl(var(--surface-dark-foreground))]/50 mb-8 max-w-md mx-auto">Our AI can help customize any template to match your specific needs.</p>
            <Link to="/resume-builder">
              <Button size="lg" className="rounded-full px-8 h-12 text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg">Start Building Your Resume</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Templates;
