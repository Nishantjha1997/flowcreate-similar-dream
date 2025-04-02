
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const exampleResumes = [
  {
    id: 1,
    title: "Marketing Manager",
    template: "Modern",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    category: "Marketing"
  },
  {
    id: 2,
    title: "Software Engineer",
    template: "Technical",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    category: "Technology"
  },
  {
    id: 3,
    title: "Graphic Designer",
    template: "Creative",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6", 
    category: "Design"
  },
  {
    id: 4,
    title: "Financial Analyst",
    template: "Professional",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    category: "Finance"
  },
  {
    id: 5,
    title: "Project Manager",
    template: "Executive",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    category: "Management"
  },
  {
    id: 6,
    title: "UX/UI Designer",
    template: "Contemporary",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    category: "Design"
  },
  {
    id: 7,
    title: "Data Scientist",
    template: "Technical",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    category: "Technology"
  },
  {
    id: 8,
    title: "Content Writer",
    template: "Elegant",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    category: "Marketing"
  },
];

const categories = ["All", "Technology", "Marketing", "Design", "Finance", "Management"];

const Examples = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResumes = exampleResumes.filter((resume) => {
    const matchesCategory = selectedCategory === "All" || resume.category === selectedCategory;
    const matchesSearch = 
      resume.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resume.template.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Example Resumes
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Find inspiration from professionally crafted resumes for various industries
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
                placeholder="Search examples..."
                className="pl-10 min-w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredResumes.map((resume) => (
              <div key={resume.id} className="template-card group">
                <div className="relative">
                  <img 
                    src={resume.image} 
                    alt={resume.title} 
                    className="w-full aspect-[3/4] object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-primary text-white text-xs font-semibold px-2 py-1 rounded">
                    {resume.template}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-foreground">{resume.title}</h3>
                  <p className="text-sm text-muted-foreground">{resume.category}</p>
                </div>
                <div className="template-overlay">
                  <Link to={`/resume-builder?template=${resume.id}&example=true`}>
                    <Button>
                      Use this example
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {filteredResumes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No example resumes found matching your criteria.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Examples;
