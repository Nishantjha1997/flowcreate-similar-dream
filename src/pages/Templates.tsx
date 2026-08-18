import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search, Star, CheckCircle, Award, Briefcase, Code, Palette, Building2, Zap, Crown, AlertTriangle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResumeTemplatePreview } from '@/components/ResumeTemplatePreview';
import { TEMPLATE_REGISTRY } from '@/templates/registry';
import { usePageMeta } from '@/hooks/usePageMeta';
import { professions } from '@/data/professions';
import { ScrollReveal } from '@/hooks/useScrollAnimation';

// Derive category chips from the registry so new templates automatically
// surface their category (order: All first, then registry order, de-duped).
const categories = ["All", ...Array.from(new Set(TEMPLATE_REGISTRY.map((t) => t.category)))];

const Templates = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const pageTitle = selectedCategory === "All" 
    ? "Resume Templates — 30+ Free Professional & ATS-Friendly Designs | MakeCV"
    : `${selectedCategory} Resume Templates — Free Professional Designs | MakeCV`;

  usePageMeta({
    title: pageTitle,
    description: `Browse ${TEMPLATE_REGISTRY.length}+ free ATS-optimized resume templates for ${selectedCategory === "All" ? "every industry" : selectedCategory.toLowerCase() + " professionals"}. Fully customizable, instant PDF download. No credit card required.`,
  });

  const filteredTemplates = TEMPLATE_REGISTRY.filter((template) => {
    // Filter by tab
    if (activeTab === "featured" && !template.featured) return false;
    if (activeTab === "popular" && (template.key === "coral-creative" || template.key === "emerald-minimal")) return false;
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
          <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="apple-headline-lg mb-4">
              Resume Templates
            </h1>
            <p className="apple-subheadline mx-auto">
              Choose from {TEMPLATE_REGISTRY.length}+ professionally designed templates for every industry.
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
          </ScrollReveal>

          {/* Filter Bar */}
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <TabsList className="grid w-full sm:w-auto grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="featured">
                  <Star className="h-4 w-4 mr-1 hidden sm:inline" /> Featured
                </TabsTrigger>
                <TabsTrigger value="popular">
                  <CheckCircle className="h-4 w-4 mr-1 hidden sm:inline" /> Popular
                </TabsTrigger>
                <TabsTrigger value="ats">
                  <Award className="h-4 w-4 mr-1 hidden sm:inline" /> ATS
                </TabsTrigger>
              </TabsList>
              
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search templates..."
                  className="pl-10 w-full rounded-full h-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </Tabs>

          <div className="mb-8 flex overflow-x-auto py-2 space-x-2 scrollbar-none max-w-7xl mx-auto">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap rounded-full text-xs h-9 px-4 shrink-0"
              >
                {category === "Technology" && <Code className="h-3.5 w-3.5 mr-1" />}
                {category === "Creative" && <Palette className="h-3.5 w-3.5 mr-1" />}
                {category === "Executive" && <Building2 className="h-3.5 w-3.5 mr-1" />}
                {category === "Corporate" && <Briefcase className="h-3.5 w-3.5 mr-1" />}
                {category}
              </Button>
            ))}
          </div>
          
          {/* Templates Grid */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl mx-auto">
            {filteredTemplates.map((template, i) => (
              <ScrollReveal key={template.key} delay={i * 40}>
                <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-2xl border border-border/40 bg-background group flex flex-col">
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted/50">
                    <ResumeTemplatePreview 
                      templateKey={template.key}
                      className="w-full h-full transform transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  
                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-1.5 px-4 pt-3">
                    {template.featured && <Badge className="bg-primary text-xs">Featured</Badge>}
                    {template.atsOptimized ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs">ATS-Friendly</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-xs" title="This layout may not extract cleanly for an applicant tracking system - use Recruiter View in the builder to check.">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Complex layout
                      </Badge>
                    )}
                    {template.premium ? (
                      <Badge className="bg-amber-500 text-white text-xs"><Crown className="h-3 w-3 mr-1" />Premium</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs">Free</Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-4 pt-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="mb-2">
                        <h3 className="text-lg font-semibold">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">{template.category}</p>
                      </div>
                      
                      <p className="text-sm mb-4 text-muted-foreground line-clamp-2">{template.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
                      <Link to={`/resume-builder?template=${template.key}`}>
                        <Button variant="outline" className="w-full text-xs">Preview</Button>
                      </Link>
                      <Link to={`/resume-builder?template=${template.key}&edit=true`}>
                        <Button className="w-full text-xs">Use Template</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-16">
              <p className="text-lg font-medium text-foreground">No templates found matching your criteria.</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Try clearing filters or searching for something else.</p>
              <Button variant="outline" onClick={() => { setSelectedCategory("All"); setSearchQuery(""); setActiveTab("all"); }}>
                Reset All Filters
              </Button>
            </div>
          )}

          {/* Profession Templates SEO Section */}
          <div className="mt-24 pt-12 border-t border-border/40 max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Resume Templates by Profession
              </h2>
              <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
                Role-tailored resume templates with pre-written achievements and keywords.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {professions.map((prof) => (
                <Link
                  key={prof.slug}
                  to={`/resume-template/${prof.slug}`}
                  className="rounded-xl border border-border/40 p-3 hover:border-primary hover:shadow-sm transition-all text-center group bg-background"
                >
                  <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {prof.title.replace(' Resume Template', '')}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{prof.category}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Templates;
