
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search, Star, CheckCircle, Award, Briefcase, Code, Palette, Heart, GraduationCap, Building2, Users, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ResumeData } from '@/utils/resumeAdapterUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResumeTemplatePreview } from '@/components/ResumeTemplatePreview';

// Updated Templates with Enhanced Variety and Creative Designs
const templates = [
  // Professional Templates - Enhanced with variety
  {
    id: 1,
    name: "Executive Modern",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    category: "Professional",
    templateKey: "modern",
    featured: true,
    popular: true,
    atsOptimized: true,
    description: "Cutting-edge professional template with gradient headers and modern typography, perfect for tech executives."
  },
  {
    id: 2,
    name: "Corporate Classic",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    category: "Professional",
    templateKey: "classic",
    featured: false,
    popular: true,
    atsOptimized: true,
    description: "Sophisticated traditional design with elegant typography, ideal for finance and legal professionals."
  },
  {
    id: 3,
    name: "Business Elite",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    category: "Professional",
    templateKey: "professional",
    featured: false,
    popular: true,
    atsOptimized: true,
    description: "Premium corporate template with clean lines and professional aesthetics for all industries."
  },
  
  // Technology Templates - Enhanced designs
  {
    id: 4,
    name: "Software Engineer Pro",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    category: "Technology",
    templateKey: "technical",
    featured: true,
    popular: false,
    atsOptimized: true,
    description: "Matrix-inspired dark theme with terminal aesthetics, perfect for software engineers and developers."
  },
  {
    id: 5,
    name: "DevOps Specialist",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    category: "Technology",
    templateKey: "developer",
    featured: false,
    popular: true,
    atsOptimized: true,
    description: "Code-focused design with emerald accents and mono fonts, ideal for DevOps and system engineers."
  },
  {
    id: 6,
    name: "Data Scientist",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    category: "Technology",
    templateKey: "data-scientist",
    featured: true,
    popular: false,
    atsOptimized: true,
    description: "Purple-themed analytical design with structured layouts for data scientists and researchers."
  },
  
  // Creative & Design Templates - Bold new designs
  {
    id: 7,
    name: "Creative Portfolio",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6", 
    category: "Creative",
    templateKey: "creative",
    featured: true,
    popular: false,
    atsOptimized: false,
    description: "Vibrant gradient design with rounded corners and creative flair for designers and artists."
  },
  {
    id: 8,
    name: "UI/UX Designer",
    image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9",
    category: "Creative",
    templateKey: "elegant",
    featured: false,
    popular: true,
    atsOptimized: false,
    description: "Rose-themed sophisticated design with elegant typography for UI/UX designers."
  },
  {
    id: 9,
    name: "Graphic Artist",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d",
    category: "Creative",
    templateKey: "artistic",
    featured: false,
    popular: false,
    atsOptimized: false,
    description: "Bold artistic template with amber gradients and dynamic layouts for graphic artists."
  },
  
  // Healthcare Templates - New professional medical designs
  {
    id: 10,
    name: "Medical Professional",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56",
    category: "Healthcare",
    templateKey: "medical",
    featured: true,
    popular: true,
    atsOptimized: true,
    description: "Teal-themed healthcare template with clean design for doctors and medical professionals."
  },
  {
    id: 11,
    name: "Pharmaceutical Specialist",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f",
    category: "Healthcare",
    templateKey: "pharma",
    featured: false,
    popular: false,
    atsOptimized: true,
    description: "Blue-accented professional design for pharmaceutical and research professionals."
  },
  
  // Education & Academia Templates - Enhanced academic styling
  {
    id: 12,
    name: "Academic Researcher",
    image: "https://images.unsplash.com/photo-1568667256549-094345857637",
    category: "Education",
    templateKey: "academic",
    featured: true,
    popular: false,
    atsOptimized: true,
    description: "Indigo-themed scholarly design with traditional elements for professors and researchers."
  },
  {
    id: 13,
    name: "Teacher Professional",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
    category: "Education",
    templateKey: "teacher",
    featured: false,
    popular: true,
    atsOptimized: true,
    description: "Green-accented educational template perfect for teachers and education professionals."
  },
  
  // Sales & Marketing Templates - Dynamic and energetic
  {
    id: 14,
    name: "Sales Executive",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf",
    category: "Sales",
    templateKey: "sales",
    featured: true,
    popular: true,
    atsOptimized: true,
    description: "High-energy orange gradient design that showcases results and achievements for sales professionals."
  },
  {
    id: 15,
    name: "Marketing Manager",
    image: "https://images.unsplash.com/photo-1553484771-371a605b060b",
    category: "Marketing",
    templateKey: "marketing",
    featured: false,
    popular: true,
    atsOptimized: true,
    description: "Pink-to-purple gradient design with creative elements for marketing professionals."
  },
  {
    id: 16,
    name: "Digital Marketing Specialist",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
    category: "Marketing",
    templateKey: "digital-marketing",
    featured: true,
    popular: false,
    atsOptimized: true,
    description: "Multi-colored gradient backdrop with modern design for digital marketing experts."
  },
  
  // Finance & Consulting Templates - Professional with distinction
  {
    id: 17,
    name: "Financial Analyst",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
    category: "Finance",
    templateKey: "finance",
    featured: false,
    popular: true,
    atsOptimized: true,
    description: "Emerald-themed professional template emphasizing trust and analytical skills."
  },
  {
    id: 18,
    name: "Management Consultant",
    image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0",
    category: "Consulting",
    templateKey: "consultant",
    featured: true,
    popular: false,
    atsOptimized: true,
    description: "Dark sophisticated header with clean layouts for strategic consultants and advisors."
  },
  
  // Executive & Leadership Templates - Premium designs
  {
    id: 19,
    name: "C-Level Executive",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    category: "Executive",
    templateKey: "executive",
    featured: true,
    popular: false,
    atsOptimized: true,
    description: "Premium executive template with elegant typography and sophisticated styling."
  },
  {
    id: 20,
    name: "VP Leadership",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    category: "Executive",
    templateKey: "vp-leader",
    featured: false,
    popular: true,
    atsOptimized: true,
    description: "Navy blue executive template with bold typography for senior leadership roles."
  },
  
  // ATS-Optimized Simple Templates - Clean and scannable
  {
    id: 21,
    name: "ATS Optimized Pro",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    category: "ATS-Friendly",
    templateKey: "ats-pro",
    featured: true,
    popular: true,
    atsOptimized: true,
    description: "Specifically designed for ATS systems with clean formatting and optimal keyword placement."
  },
  {
    id: 22,
    name: "Simple & Clean",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    category: "ATS-Friendly",
    templateKey: "compact",
    featured: false,
    popular: true,
    atsOptimized: true,
    description: "Compact space-efficient layout optimized for both ATS systems and human readers."
  },
  {
    id: 23,
    name: "Minimal ATS",
    image: "https://images.unsplash.com/photo-1586281380117-5a60ae2050cc",
    category: "ATS-Friendly",
    templateKey: "minimalist",
    featured: false,
    popular: false,
    atsOptimized: true,
    description: "Ultra-clean minimalist design with optimal ATS parsing and maximum readability."
  },
  
  // Startup & Entrepreneurship Templates - Modern and dynamic
  {
    id: 24,
    name: "Startup Founder",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
    category: "Startup",
    templateKey: "startup",
    featured: true,
    popular: false,
    atsOptimized: false,
    description: "Violet-to-cyan gradient design perfect for entrepreneurs and startup professionals."
  },
  {
    id: 25,
    name: "Product Manager",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
    category: "Product",
    templateKey: "product-manager",
    featured: false,
    popular: true,
    atsOptimized: true,
    description: "Cyan-themed modern template highlighting product launches and user metrics."
  }
];

const categories = ["All", "Professional", "Technology", "Creative", "Healthcare", "Education", "Sales", "Marketing", "Finance", "Consulting", "Executive", "ATS-Friendly", "Startup", "Product"];

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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              World-Class Resume Templates
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Choose from our collection of {templates.length}+ professionally designed templates for every industry
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
                {category === "Healthcare" && <Heart className="h-4 w-4 mr-1" />}
                {category === "Education" && <GraduationCap className="h-4 w-4 mr-1" />}
                {category === "Executive" && <Building2 className="h-4 w-4 mr-1" />}
                {category === "Sales" && <Users className="h-4 w-4 mr-1" />}
                {category}
              </Button>
            ))}
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg template-card group">
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
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

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Can't find the perfect template?</h2>
            <p className="text-muted-foreground mb-6">Our AI can help customize any template to match your specific needs</p>
            <Link to="/resume-builder">
              <Button size="lg">Start Building Your Resume</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Templates;
