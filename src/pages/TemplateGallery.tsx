
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Edit3, 
  Eye, 
  FileText, 
  Grid, 
  List, 
  PaintBucket 
} from 'lucide-react';

const templateCategories = [
  'Modern', 
  'Classic', 
  'Creative', 
  'Professional', 
  'Technical', 
  'Minimal'
];

const TemplateGallery: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Resume Templates</h1>
        <div className="flex space-x-2">
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon" 
            onClick={() => setViewMode('grid')}
          >
            <Grid />
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon" 
            onClick={() => setViewMode('list')}
          >
            <List />
          </Button>
        </div>
      </div>

      <div className="flex space-x-2 mb-8">
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

      <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {[1, 2, 3, 4, 5, 6].map((template) => (
          <Card 
            key={template} 
            className="hover:shadow-lg transition-shadow duration-300"
          >
            <CardHeader>
              <CardTitle>Template {template}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
              <div className="bg-muted rounded-lg h-48 flex items-center justify-center">
                Placeholder Image
              </div>
              <div className="flex justify-between space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" /> Preview
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
                <Button variant="outline" size="sm">
                  <Edit3 className="mr-2 h-4 w-4" /> Customize
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TemplateGallery;
