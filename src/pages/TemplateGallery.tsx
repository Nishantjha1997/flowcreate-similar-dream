import React, { useState } from 'react';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Edit3, Eye, Grid, List, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import TemplatePreviewModal from '@/components/templates/TemplatePreviewModal';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const templateCategories = [
  'Modern', 
  'Classic', 
  'Creative', 
  'Professional', 
  'Technical', 
  'Minimal'
];

const templates = [
  {
    id: 1,
    name: "Modern Professional",
    description: "Clean and contemporary design perfect for tech and business roles",
    category: "Modern",
    image: "https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=400",
    popular: true
  },
  {
    id: 2,
    name: "Classic Executive",
    description: "Traditional layout trusted by senior professionals",
    category: "Classic",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=400",
    popular: true
  },
  {
    id: 3,
    name: "Creative Portfolio",
    description: "Stand out with a unique design for creative industries",
    category: "Creative",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400",
    popular: false
  },
  {
    id: 4,
    name: "Technical Specialist",
    description: "Optimized for technical roles and skill highlighting",
    category: "Technical",
    image: "https://images.unsplash.com/photo-1512626120412-faf41adb4874?w=400",
    popular: false
  },
  {
    id: 5,
    name: "Minimal Clean",
    description: "Simple and elegant design that lets your content shine",
    category: "Minimal",
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400",
    popular: true
  },
  {
    id: 6,
    name: "Professional Impact",
    description: "Make a strong first impression with this balanced layout",
    category: "Professional",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400",
    popular: false
  }
];

const TemplateGallery: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof templates[0] | null>(null);

  const filteredTemplates = selectedCategory
    ? templates.filter(template => template.category === selectedCategory)
    : templates;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col space-y-6 mb-12">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Resume Templates</h1>
            <p className="text-muted-foreground mt-2">
              Choose from our professionally designed templates
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon" 
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon" 
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={!selectedCategory ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
          >
            All Templates
          </Button>
          {templateCategories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1'
      }`}>
        {filteredTemplates.map((template) => (
          <Card 
            key={template.id} 
            className="group hover:shadow-lg transition-all duration-300"
          >
            <CardContent className="p-0">
              <div className="relative aspect-[3/4] rounded-t-lg overflow-hidden">
                <img 
                  src={template.image} 
                  alt={template.name} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <Eye className="mr-2 h-4 w-4" /> Preview
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => window.location.href = `/resume-builder?template=${template.id}`}
                  >
                    <Edit3 className="mr-2 h-4 w-4" /> Use Template
                  </Button>
                </div>
              </div>
              
              <div className="p-6">
                <CardTitle>{template.name}</CardTitle>
                <CardDescription className="mt-1">
                  {template.description}
                </CardDescription>
                {template.popular && (
                  <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
                    Popular
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredTemplates.length === 0 && (
        <p className="text-center text-muted-foreground">
          No templates found for the selected category.
        </p>
      )}

        {selectedTemplate && (
          <TemplatePreviewModal
            isOpen={!!selectedTemplate}
            onClose={() => setSelectedTemplate(null)}
            template={selectedTemplate}
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default TemplateGallery;
