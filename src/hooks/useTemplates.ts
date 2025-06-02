
import { useState, useEffect } from "react";

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  isActive: boolean;
  usage: number;
  createdAt: string;
  templateKey: string;
}

// Import the actual templates from the website
const websiteTemplates = [
  {
    id: "1",
    name: "Modern Professional",
    category: "Professional",
    description: "Clean, sleek design with contemporary elements",
    templateKey: "modern",
  },
  {
    id: "2", 
    name: "Executive Classic",
    category: "Traditional",
    description: "Traditional layout that stands the test of time",
    templateKey: "classic",
  },
  {
    id: "3",
    name: "Creative Portfolio",
    category: "Design", 
    description: "Eye-catching design for creative professionals",
    templateKey: "creative",
  },
  {
    id: "4",
    name: "Tech Specialist",
    category: "Technical",
    description: "Optimized for tech and engineering fields",
    templateKey: "technical",
  },
  {
    id: "5",
    name: "Corporate Elite",
    category: "Professional",
    description: "Polished and refined for executive positions",
    templateKey: "professional",
  }
];

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    // Convert website templates to admin template format with usage stats
    const adminTemplates: Template[] = websiteTemplates.map((template, index) => ({
      ...template,
      isActive: true,
      usage: Math.floor(Math.random() * 300) + 50, // Simulated usage data
      createdAt: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
    }));

    setTemplates(adminTemplates);
  }, []);

  const toggleTemplate = (templateId: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === templateId ? { ...t, isActive: !t.isActive } : t
    ));
  };

  const deleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  const addTemplate = (newTemplate: Omit<Template, 'id' | 'usage' | 'createdAt'>) => {
    const template: Template = {
      ...newTemplate,
      id: (templates.length + 1).toString(),
      usage: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTemplates(prev => [...prev, template]);
  };

  return {
    templates,
    toggleTemplate,
    deleteTemplate,
    addTemplate
  };
}
