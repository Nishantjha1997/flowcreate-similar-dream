
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
  featured?: boolean;
  atsOptimized?: boolean;
}

// Enhanced template data with new categories and features
const websiteTemplates = [
  // Professional Templates
  {
    id: "1",
    name: "Executive Modern",
    category: "Professional",
    description: "Clean and professional template with modern layout, perfect for senior executives",
    templateKey: "modern",
    featured: true,
    atsOptimized: true,
  },
  {
    id: "2", 
    name: "Corporate Classic",
    category: "Professional",
    description: "Timeless design with traditional formatting, suitable for all industries",
    templateKey: "classic",
    featured: false,
    atsOptimized: true,
  },
  {
    id: "3",
    name: "Business Elite",
    category: "Professional",
    description: "Balanced and versatile template for professionals in any field",
    templateKey: "professional",
    featured: false,
    atsOptimized: true,
  },
  
  // Technology Templates
  {
    id: "4",
    name: "Software Engineer Pro",
    category: "Technology",
    description: "Focused on technical skills with dedicated sections for projects",
    templateKey: "technical",
    featured: true,
    atsOptimized: true,
  },
  {
    id: "5",
    name: "DevOps Specialist",
    category: "Technology", 
    description: "Perfect for DevOps engineers with emphasis on tools and certifications",
    templateKey: "developer",
    featured: false,
    atsOptimized: true,
  },
  {
    id: "6",
    name: "Data Scientist",
    category: "Technology",
    description: "Specialized for data scientists with sections for publications and projects",
    templateKey: "data-scientist",
    featured: true,
    atsOptimized: true,
  },
  
  // Creative Templates
  {
    id: "7",
    name: "Creative Portfolio",
    category: "Creative",
    description: "Bold and eye-catching layout for creative professionals",
    templateKey: "creative",
    featured: true,
    atsOptimized: false,
  },
  {
    id: "8",
    name: "UI/UX Designer",
    category: "Creative",
    description: "Refined and elegant design with sophisticated typography",
    templateKey: "elegant",
    featured: false,
    atsOptimized: false,
  },
  
  // Healthcare Templates
  {
    id: "10",
    name: "Medical Professional",
    category: "Healthcare",
    description: "Professional template designed for doctors and healthcare workers",
    templateKey: "medical",
    featured: true,
    atsOptimized: true,
  },
  
  // Education Templates
  {
    id: "12",
    name: "Academic Researcher",
    category: "Education",
    description: "Perfect for professors and researchers with publication sections",
    templateKey: "academic",
    featured: true,
    atsOptimized: true,
  },
  
  // Executive Templates
  {
    id: "19",
    name: "C-Level Executive",
    category: "Executive",
    description: "Sophisticated design for senior managers and executives",
    templateKey: "executive",
    featured: true,
    atsOptimized: true,
  },
  
  // ATS-Friendly Templates
  {
    id: "21",
    name: "ATS Optimized Pro",
    category: "ATS-Friendly",
    description: "Specifically designed to pass ATS systems while maintaining professional appearance",
    templateKey: "ats-pro",
    featured: true,
    atsOptimized: true,
  },
  {
    id: "22",
    name: "Simple & Clean",
    category: "ATS-Friendly",
    description: "Space-efficient layout optimized for ATS parsing",
    templateKey: "compact",
    featured: false,
    atsOptimized: true,
  },
  {
    id: "23",
    name: "Minimal ATS",
    category: "ATS-Friendly",
    description: "Ultra-clean design optimized for ATS parsing with maximum readability",
    templateKey: "minimalist",
    featured: false,
    atsOptimized: true,
  }
];

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    // Convert website templates to admin template format with enhanced data
    const adminTemplates: Template[] = websiteTemplates.map((template, index) => ({
      ...template,
      isActive: true,
      usage: Math.floor(Math.random() * 500) + 50, // Simulated usage data with higher ranges
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
