import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, ArrowRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { resolveTemplateKey, getTemplate } from '@/templates/registry';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ScrollReveal } from '@/hooks/useScrollAnimation';

const exampleResumes = [
  {
    id: 1,
    title: "Marketing Manager",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    category: "Marketing"
  },
  {
    id: 2,
    title: "Software Engineer",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    category: "Technology"
  },
  {
    id: 3,
    title: "Graphic Designer",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6", 
    category: "Design"
  },
  {
    id: 4,
    title: "Financial Analyst",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    category: "Finance"
  },
  {
    id: 5,
    title: "Project Manager",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    category: "Management"
  },
  {
    id: 6,
    title: "UX/UI Designer",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    category: "Design"
  },
  {
    id: 7,
    title: "Data Scientist",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    category: "Technology"
  },
  {
    id: 8,
    title: "Content Writer",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    category: "Marketing"
  },
];

const categories = ["All", "Technology", "Marketing", "Design", "Finance", "Management"];

const Examples = () => {
  usePageMeta({
    title: 'Resume Examples — Professionally Formatted Resume Samples | MakeCV',
    description: 'Browse real-world resume examples across engineering, design, marketing, management, and finance. Free to customize and download.',
  });

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResumes = exampleResumes.filter((resume) => {
    const matchesCategory = selectedCategory === "All" || resume.category === selectedCategory;
    const resolvedKey = resolveTemplateKey(String(resume.id));
    const templateDef = getTemplate(resolvedKey);
    const matchesSearch = 
      resume.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      templateDef.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resume.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Resume Examples & Samples
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Find inspiration from professionally crafted resumes tailored for popular industries and roles
            </p>
          </div>
          </ScrollReveal>

          {/* Filter Bar */}
          <div className="mb-10 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center max-w-6xl mx-auto">
            <div className="flex overflow-x-auto py-1 space-x-2 scrollbar-none">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap rounded-full text-xs h-9 px-4 shrink-0"
                >
                  {category}
                </Button>
              ))}
            </div>
            
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search examples..."
                className="w-full pl-10 rounded-full h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {filteredResumes.map((resume, i) => {
              const resolvedKey = resolveTemplateKey(String(resume.id));
              const templateDef = getTemplate(resolvedKey);
              return (
                <ScrollReveal key={resume.id} delay={i * 50}>
                <Card className="overflow-hidden hover:border-primary/50 transition-all hover:shadow-md h-full flex flex-col">
                  <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                    <img 
                      src={resume.image} 
                      alt={resume.title} 
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-background/90 backdrop-blur-md shadow-sm font-semibold text-xs">
                        {templateDef.name}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base font-semibold truncate">{resume.title}</CardTitle>
                      <Badge variant="outline" className="text-[10px] shrink-0">{resume.category}</Badge>
                    </div>
                    <CardDescription className="text-xs">
                      Optimized for ATS & recruiter review
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 mt-auto">
                    <Link to={`/resume-builder?template=${templateDef.key}&example=true`} className="block w-full">
                      <Button className="w-full text-xs h-9 rounded-lg" variant="default">
                        Use this template <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
                </ScrollReveal>
              );
            })}
          </div>
          
          {filteredResumes.length === 0 && (
            <div className="text-center py-16">
              <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-lg font-medium text-foreground">No example resumes found</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Try adjusting your search terms or category filter</p>
              <Button variant="outline" onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}>
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Examples;
