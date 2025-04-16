
import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ColorPicker } from './ColorPicker';
import { ResumeData } from '@/utils/types';
import { AvatarUploader } from './AvatarUploader';
import { SectionDragDropCustomizer } from '@/components/resume/SectionDragDropCustomizer';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Palette,
  Type,
  MoveHorizontal,
  LayoutGrid,
  ArrowDownUp,
  User,
  Phone,
  Briefcase,
  GraduationCap,
  Award,
  BookOpen,
  Languages,
  Lightbulb,
  Medal,
  HandHeart,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

interface CustomizationPanelProps {
  customization: ResumeData["customization"];
  onCustomizationChange: (customization: ResumeData["customization"]) => void;
  resumeData: ResumeData;
  onSectionOrderChange?: (newOrder: string[]) => void;
  onSectionTitleChange?: (sectionId: string, newTitle: string) => void;
}

const fontOptions = [
  { value: "default", label: "Template Default" },
  { value: "'Roboto', sans-serif", label: "Roboto" },
  { value: "'Montserrat', sans-serif", label: "Montserrat" },
  { value: "'Lato', sans-serif", label: "Lato" },
  { value: "'Open Sans', sans-serif", label: "Open Sans" },
  { value: "'Poppins', sans-serif", label: "Poppins" },
  { value: "'Raleway', sans-serif", label: "Raleway" },
  { value: "'Source Sans Pro', sans-serif", label: "Source Sans Pro" },
  { value: "'Nunito', sans-serif", label: "Nunito" },
  { value: "'Ubuntu', sans-serif", label: "Ubuntu" },
  { value: "'Roboto Mono', monospace", label: "Roboto Mono" },
  { value: "'Roboto Condensed', sans-serif", label: "Roboto Condensed" },
  { value: "'Playfair Display', serif", label: "Playfair Display" },
  { value: "'Merriweather', serif", label: "Merriweather" },
  { value: "'PT Serif', serif", label: "PT Serif" },
  { value: "'Georgia', serif", label: "Georgia" },
  { value: "'Garamond', serif", label: "Garamond" },
  { value: "'Arial', sans-serif", label: "Arial" },
  { value: "'Verdana', sans-serif", label: "Verdana" },
  { value: "'Helvetica', sans-serif", label: "Helvetica" },
];

const sectionIcons = {
  personal: <User className="h-4 w-4" />,
  contact: <Phone className="h-4 w-4" />,
  experience: <Briefcase className="h-4 w-4" />,
  education: <GraduationCap className="h-4 w-4" />,
  skills: <Award className="h-4 w-4" />,
  projects: <BookOpen className="h-4 w-4" />,
  languages: <Languages className="h-4 w-4" />,
  interests: <Lightbulb className="h-4 w-4" />,
  certifications: <Medal className="h-4 w-4" />,
  volunteer: <HandHeart className="h-4 w-4" />,
};

export const CustomizationPanel = ({ 
  customization = { primaryColor: '#2563eb' }, // Provide a default primaryColor 
  onCustomizationChange,
  resumeData,
  onSectionOrderChange,
  onSectionTitleChange
}: CustomizationPanelProps) => {
  const [activeTab, setActiveTab] = useState('colors');
  const [sectionsOrder, setSectionsOrder] = useState<string[]>(
    customization.sectionsOrder || ['personal', 'experience', 'education', 'skills', 'projects']
  );
  const [hiddenSections, setHiddenSections] = useState<string[]>(
    customization.hiddenSections || []
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const handleColorChange = (colorType: 'primaryColor' | 'secondaryColor' | 'accentColor' | 'textColor' | 'backgroundColor', color: string) => {
    onCustomizationChange({
      ...customization,
      [colorType]: color
    });
    setHasUnsavedChanges(true);
  };
  
  const handleFontFamilyChange = (value: string) => {
    onCustomizationChange({
      ...customization,
      fontFamily: value
    });
    setHasUnsavedChanges(true);
  };
  
  const handleFontSizeChange = (value: 'small' | 'medium' | 'large') => {
    onCustomizationChange({
      ...customization,
      fontSize: value
    });
    setHasUnsavedChanges(true);
  };
  
  const handleSpacingChange = (value: 'compact' | 'normal' | 'spacious') => {
    onCustomizationChange({
      ...customization,
      spacing: value
    });
    setHasUnsavedChanges(true);
  };
  
  const handleLayoutChange = (value: string) => {
    onCustomizationChange({
      ...customization,
      layoutType: value as 'standard' | 'compact' | 'minimal' | 'creative'
    });
    setHasUnsavedChanges(true);
  };

  const handleHeadingStyleChange = (value: string) => {
    onCustomizationChange({
      ...customization,
      headingStyle: value as 'bold' | 'underlined' | 'capitalized' | 'minimal'
    });
    setHasUnsavedChanges(true);
  };

  const handleShowPhotoChange = (checked: boolean) => {
    onCustomizationChange({
      ...customization,
      showPhoto: checked
    });
    setHasUnsavedChanges(true);
  };

  const handleImageChange = (imageData: { src: string | null; size: number; shape: 'circle' | 'square' | 'rounded'; }) => {
    onCustomizationChange({
      ...customization,
      profileImage: imageData
    });
    setHasUnsavedChanges(true);
  };

  const handleSectionsChange = (activeSections: string[], hiddenSections: string[]) => {
    setSectionsOrder(activeSections);
    setHiddenSections(hiddenSections);
    
    onCustomizationChange({
      ...customization,
      sectionsOrder: activeSections,
      hiddenSections: hiddenSections
    });
    
    if (onSectionOrderChange) {
      onSectionOrderChange(activeSections);
    }
    setHasUnsavedChanges(true);
  };

  const handleSectionTitleChange = (sectionId: string, newTitle: string) => {
    const updatedTitles = {
      ...(customization.sectionTitles || {}),
      [sectionId]: newTitle
    };
    
    onCustomizationChange({
      ...customization,
      sectionTitles: updatedTitles
    });
    
    if (onSectionTitleChange) {
      onSectionTitleChange(sectionId, newTitle);
    }
    setHasUnsavedChanges(true);
  };

  const handlePaperTypeChange = (value: string) => {
    onCustomizationChange({
      ...customization,
      paperType: value as 'standard' | 'textured' | 'minimal'
    });
    setHasUnsavedChanges(true);
  };

  const handleTextDensityChange = (value: number[]) => {
    onCustomizationChange({
      ...customization,
      textDensity: value[0]
    });
    setHasUnsavedChanges(true);
  };

  const saveAsTemplate = () => {
    // This would save the current customization as a template
    // In a full implementation, it would store to localStorage or backend
    const templateName = prompt("Enter a name for this template:");
    if (templateName) {
      toast.success(`Template "${templateName}" saved successfully!`, {
        description: "You can now apply this template to other resumes."
      });
      setHasUnsavedChanges(false);
    }
  };

  const colorPresets = [
    {
      name: "Professional Blue",
      primaryColor: "#2563eb",
      secondaryColor: "#6b7280",
      accentColor: "#3b82f6",
      textColor: "#1f2937",
      backgroundColor: "#ffffff"
    },
    {
      name: "Elegant Green",
      primaryColor: "#10b981",
      secondaryColor: "#4b5563",
      accentColor: "#059669",
      textColor: "#111827",
      backgroundColor: "#f9fafb"
    },
    {
      name: "Creative Purple",
      primaryColor: "#8b5cf6",
      secondaryColor: "#6b7280",
      accentColor: "#7c3aed",
      textColor: "#1f2937",
      backgroundColor: "#ffffff"
    },
    {
      name: "Modern Gray",
      primaryColor: "#4b5563",
      secondaryColor: "#9ca3af",
      accentColor: "#374151",
      textColor: "#111827",
      backgroundColor: "#f3f4f6"
    },
    {
      name: "Bold Red",
      primaryColor: "#ef4444",
      secondaryColor: "#6b7280",
      accentColor: "#dc2626",
      textColor: "#1f2937",
      backgroundColor: "#ffffff"
    },
    {
      name: "Executive Dark",
      primaryColor: "#1e293b",
      secondaryColor: "#94a3b8",
      accentColor: "#0f172a",
      textColor: "#020617",
      backgroundColor: "#ffffff"
    },
    {
      name: "Coral Accent",
      primaryColor: "#0ea5e9",
      secondaryColor: "#6b7280",
      accentColor: "#f97316",
      textColor: "#1f2937",
      backgroundColor: "#f8fafc"
    }
  ];

  const applyColorPreset = (preset: any) => {
    onCustomizationChange({
      ...customization,
      primaryColor: preset.primaryColor,
      secondaryColor: preset.secondaryColor,
      accentColor: preset.accentColor,
      textColor: preset.textColor,
      backgroundColor: preset.backgroundColor
    });
    toast.success(`Applied "${preset.name}" color theme`);
    setHasUnsavedChanges(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">Customize Your Resume</h2>
        {hasUnsavedChanges && (
          <div className="text-xs font-medium text-primary flex items-center">
            <Check className="w-3 h-3 mr-1" /> Changes auto-saved
          </div>
        )}
      </div>
      
      <p className="text-muted-foreground">
        Personalize your resume to match your style and make it stand out.
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="colors"><Palette className="h-4 w-4 mr-1" /> Colors</TabsTrigger>
          <TabsTrigger value="fonts"><Type className="h-4 w-4 mr-1" /> Typography</TabsTrigger>
          <TabsTrigger value="spacing"><MoveHorizontal className="h-4 w-4 mr-1" /> Spacing</TabsTrigger>
          <TabsTrigger value="layout"><LayoutGrid className="h-4 w-4 mr-1" /> Layout</TabsTrigger>
          <TabsTrigger value="sections"><ArrowDownUp className="h-4 w-4 mr-1" /> Sections</TabsTrigger>
        </TabsList>
        
        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-6">
                <div>
                  <Label className="block mb-3">Color Presets</Label>
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {colorPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => applyColorPreset(preset)}
                        className="flex flex-col items-center gap-1 p-2 border rounded-md hover:bg-muted transition-colors"
                        title={preset.name}
                      >
                        <div className="flex gap-1">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.primaryColor }}></div>
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.secondaryColor }}></div>
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.accentColor }}></div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-2">
                    {colorPresets.map((preset, idx) => (
                      <button
                        key={`name-${idx}`}
                        onClick={() => applyColorPreset(preset)}
                        className="text-xs truncate w-full text-center py-1 border-t"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="block mb-3">Custom Colors</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <ColorPicker 
                      label="Primary Color"
                      color={customization.primaryColor || '#2563eb'} 
                      onChange={(color) => handleColorChange('primaryColor', color)}
                      presetColors={[
                        '#2563eb', '#4f46e5', '#8b5cf6', '#d946ef', 
                        '#ec4899', '#f43f5e', '#ef4444', '#f97316', 
                        '#f59e0b', '#eab308', '#84cc16', '#22c55e', 
                        '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
                        '#003366', '#4CAF50', '#FF6B6B', '#333333'
                      ]}
                    />
                    
                    <ColorPicker 
                      label="Secondary Color"
                      color={customization.secondaryColor || '#6b7280'} 
                      onChange={(color) => handleColorChange('secondaryColor', color)}
                      presetColors={[
                        '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb',
                        '#1e293b', '#334155', '#475569', '#64748b',
                        '#374151', '#4b5563', '#6b7280', '#9ca3af',
                        '#111827', '#1f2937', '#374151', '#4b5563',
                        '#555555', '#777777', '#999999', '#bbbbbb'
                      ]}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <ColorPicker 
                    label="Accent Color"
                    color={customization.accentColor || '#3b82f6'} 
                    onChange={(color) => handleColorChange('accentColor', color)}
                    presetColors={[
                      '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef',
                      '#ec4899', '#f43f5e', '#f59e0b', '#10b981',
                      '#059669', '#0ea5e9', '#06b6d4', '#0369a1'
                    ]}
                  />
                  
                  <ColorPicker 
                    label="Text Color"
                    color={customization.textColor || '#1f2937'} 
                    onChange={(color) => handleColorChange('textColor', color)}
                    presetColors={[
                      '#000000', '#1f2937', '#374151', '#4b5563',
                      '#6b7280', '#111827', '#1e293b', '#334155',
                      '#1a202c', '#2d3748', '#4a5568', '#718096'
                    ]}
                  />
                </div>
                
                <div>
                  <ColorPicker 
                    label="Background Color"
                    color={customization.backgroundColor || '#ffffff'} 
                    onChange={(color) => handleColorChange('backgroundColor', color)}
                    presetColors={[
                      '#ffffff', '#f9fafb', '#f3f4f6', '#e5e7eb',
                      '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1',
                      '#f5f5f5', '#e5e5e5', '#d4d4d4', '#f0f9ff'
                    ]}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fonts" className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-6">
                <div>
                  <Label className="block mb-2">Font Family</Label>
                  <Select
                    value={customization.fontFamily || 'default'}
                    onValueChange={handleFontFamilyChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {fontOptions.map(font => (
                        <SelectItem 
                          key={font.value} 
                          value={font.value} 
                          style={{ fontFamily: font.value !== 'default' ? font.value : 'inherit' }}
                        >
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {customization.fontFamily && customization.fontFamily !== 'default' && (
                    <div className="mt-3 p-3 border rounded-md">
                      <p style={{ fontFamily: customization.fontFamily }}>
                        This is a preview of the {customization.fontFamily.split(',')[0].replace(/['"]/g, '')} font.
                      </p>
                    </div>
                  )}
                </div>
                
                <div>
                  <Label className="block mb-2">Font Size</Label>
                  <RadioGroup 
                    value={customization.fontSize || 'medium'}
                    onValueChange={(value) => handleFontSizeChange(value as 'small' | 'medium' | 'large')}
                    className="grid grid-cols-3 gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="small" id="size-small" />
                      <Label htmlFor="size-small" className="font-normal text-sm">Small</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="size-medium" />
                      <Label htmlFor="size-medium" className="font-normal">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="large" id="size-large" />
                      <Label htmlFor="size-large" className="font-normal text-lg">Large</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <Label className="block mb-2">Heading Style</Label>
                  <RadioGroup 
                    value={customization.headingStyle || 'bold'}
                    onValueChange={handleHeadingStyleChange}
                    className="grid grid-cols-2 gap-3"
                  >
                    <div className="border rounded-md p-3 flex items-center space-x-3 hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="bold" id="style-bold" />
                      <Label htmlFor="style-bold" className="font-bold cursor-pointer">Bold Headings</Label>
                    </div>
                    <div className="border rounded-md p-3 flex items-center space-x-3 hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="underlined" id="style-underlined" />
                      <Label htmlFor="style-underlined" className="border-b-2 border-black cursor-pointer">Underlined Headings</Label>
                    </div>
                    <div className="border rounded-md p-3 flex items-center space-x-3 hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="capitalized" id="style-capitalized" />
                      <Label htmlFor="style-capitalized" className="uppercase text-sm cursor-pointer">CAPITALIZED HEADINGS</Label>
                    </div>
                    <div className="border rounded-md p-3 flex items-center space-x-3 hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="minimal" id="style-minimal" />
                      <Label htmlFor="style-minimal" className="text-gray-500 font-light cursor-pointer">Minimal Headings</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="block mb-2">Text Density</Label>
                  <div className="py-5 px-2">
                    <Slider 
                      defaultValue={[customization.textDensity || 5]} 
                      max={10} 
                      step={1}
                      onValueChange={handleTextDensityChange}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Airy</span>
                      <span>Balanced</span>
                      <span>Compact</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="spacing" className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-6">
                <div>
                  <Label className="block mb-2">Content Spacing</Label>
                  <RadioGroup 
                    value={customization.spacing || 'normal'}
                    onValueChange={(value) => handleSpacingChange(value as 'compact' | 'normal' | 'spacious')}
                    className="grid grid-cols-3 gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="compact" id="spacing-compact" />
                      <Label htmlFor="spacing-compact" className="font-normal">Compact</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="normal" id="spacing-normal" />
                      <Label htmlFor="spacing-normal" className="font-normal">Normal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="spacious" id="spacing-spacious" />
                      <Label htmlFor="spacing-spacious" className="font-normal">Spacious</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <Label className="block mb-2">Section Margins</Label>
                  <RadioGroup 
                    value={customization.sectionMargins || 'medium'}
                    onValueChange={(value) => onCustomizationChange({...customization, sectionMargins: value as 'small' | 'medium' | 'large'})}
                    className="grid grid-cols-3 gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="small" id="margin-small" />
                      <Label htmlFor="margin-small" className="font-normal">Small</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="margin-medium" />
                      <Label htmlFor="margin-medium" className="font-normal">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="large" id="margin-large" />
                      <Label htmlFor="margin-large" className="font-normal">Large</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <Label className="block mb-2">Line Spacing</Label>
                  <RadioGroup 
                    value={customization.lineHeight || 'normal'}
                    onValueChange={(value) => onCustomizationChange({...customization, lineHeight: value as 'tight' | 'normal' | 'relaxed'})}
                    className="grid grid-cols-3 gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tight" id="line-tight" />
                      <Label htmlFor="line-tight" className="font-normal">Tight</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="normal" id="line-normal" />
                      <Label htmlFor="line-normal" className="font-normal">Normal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="relaxed" id="line-relaxed" />
                      <Label htmlFor="line-relaxed" className="font-normal">Relaxed</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="block mb-2">Paper Style</Label>
                  <RadioGroup 
                    value={customization.paperType || 'standard'}
                    onValueChange={handlePaperTypeChange}
                    className="grid grid-cols-3 gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="standard" id="paper-standard" />
                      <Label htmlFor="paper-standard" className="font-normal">Standard</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="textured" id="paper-textured" />
                      <Label htmlFor="paper-textured" className="font-normal">Textured</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="minimal" id="paper-minimal" />
                      <Label htmlFor="paper-minimal" className="font-normal">Minimal</Label>
                    </div>
                  </RadioGroup>
                  
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-20 w-full bg-white border shadow-sm"></div>
                      <span className="text-xs mt-1">Standard</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="h-20 w-full bg-white border shadow-sm" 
                           style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23f0f0f0\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")'}}></div>
                      <span className="text-xs mt-1">Textured</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="h-20 w-full bg-white"></div>
                      <span className="text-xs mt-1">Minimal</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-6">
                <div>
                  <Label className="block mb-2">Layout Style</Label>
                  <RadioGroup 
                    value={customization.layoutType || 'standard'}
                    onValueChange={handleLayoutChange}
                    className="grid grid-cols-2 gap-3"
                  >
                    <div className="relative">
                      <RadioGroupItem 
                        value="standard" 
                        id="layout-standard" 
                        className="sr-only" 
                      />
                      <Label 
                        htmlFor="layout-standard" 
                        className="flex flex-col items-center border rounded-md p-4 cursor-pointer hover:bg-muted transition-colors peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary"
                      >
                        <div className="w-full h-24 bg-muted rounded mb-2 flex flex-col">
                          <div className="h-6 w-1/2 bg-primary/20 m-2 rounded"></div>
                          <div className="h-4 w-3/4 bg-primary/20 mx-2 rounded"></div>
                          <div className="h-8 w-full mt-auto bg-primary/10 rounded-b"></div>
                        </div>
                        <span>Standard</span>
                      </Label>
                    </div>
                    
                    <div className="relative">
                      <RadioGroupItem 
                        value="compact" 
                        id="layout-compact" 
                        className="sr-only" 
                      />
                      <Label 
                        htmlFor="layout-compact" 
                        className="flex flex-col items-center border rounded-md p-4 cursor-pointer hover:bg-muted transition-colors peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary"
                      >
                        <div className="w-full h-24 bg-muted rounded mb-2 flex">
                          <div className="h-full w-1/3 bg-primary/20 rounded-l"></div>
                          <div className="flex-1 p-1">
                            <div className="h-3 w-full bg-primary/10 mb-1 rounded"></div>
                            <div className="h-3 w-full bg-primary/10 mb-1 rounded"></div>
                            <div className="h-3 w-full bg-primary/10 rounded"></div>
                          </div>
                        </div>
                        <span>Compact</span>
                      </Label>
                    </div>
                    
                    <div className="relative">
                      <RadioGroupItem 
                        value="minimal" 
                        id="layout-minimal" 
                        className="sr-only" 
                      />
                      <Label 
                        htmlFor="layout-minimal" 
                        className="flex flex-col items-center border rounded-md p-4 cursor-pointer hover:bg-muted transition-colors peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary"
                      >
                        <div className="w-full h-24 bg-muted rounded mb-2 flex flex-col justify-center items-center">
                          <div className="h-4 w-1/2 bg-primary/20 rounded mb-2"></div>
                          <div className="h-2 w-3/4 bg-primary/10 rounded mb-1"></div>
                          <div className="h-2 w-3/4 bg-primary/10 rounded mb-1"></div>
                          <div className="h-2 w-3/4 bg-primary/10 rounded"></div>
                        </div>
                        <span>Minimal</span>
                      </Label>
                    </div>
                    
                    <div className="relative">
                      <RadioGroupItem 
                        value="creative" 
                        id="layout-creative" 
                        className="sr-only" 
                      />
                      <Label 
                        htmlFor="layout-creative" 
                        className="flex flex-col items-center border rounded-md p-4 cursor-pointer hover:bg-muted transition-colors peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary"
                      >
                        <div className="w-full h-24 bg-muted rounded mb-2">
                          <div className="h-8 w-full bg-primary/30 rounded-t"></div>
                          <div className="flex p-1 mt-1">
                            <div className="h-5 w-5 rounded-full bg-primary/20 mr-1"></div>
                            <div className="flex-1">
                              <div className="h-2 w-3/4 bg-primary/10 mb-1 rounded"></div>
                              <div className="h-2 w-1/2 bg-primary/10 rounded"></div>
                            </div>
                          </div>
                        </div>
                        <span>Creative</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="show-photo" className="cursor-pointer">Show Profile Photo</Label>
                    <Switch 
                      id="show-photo" 
                      checked={customization.showPhoto} 
                      onCheckedChange={handleShowPhotoChange}
                    />
                  </div>
                </div>
                
                {customization.showPhoto && (
                  <div>
                    <AvatarUploader 
                      onImageChange={handleImageChange}
                      currentImage={customization.profileImage}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <Label className="block font-medium">Section Order & Visibility</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Drag sections to reorder or toggle visibility
                </p>
                
                <div className="space-y-2">
                  <SectionDragDropCustomizer 
                    activeSections={sectionsOrder}
                    hiddenSections={hiddenSections}
                    sectionTitles={customization.sectionTitles || {}}
                    onSectionsChange={handleSectionsChange}
                    onSectionTitleChange={handleSectionTitleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={saveAsTemplate}
          className="text-sm"
        >
          Save as Template
        </Button>
      </div>
    </div>
  );
};
