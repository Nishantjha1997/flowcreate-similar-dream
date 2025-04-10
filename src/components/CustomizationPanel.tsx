
import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; 
import { ColorPicker } from './ColorPicker';
import { ResumeData } from '@/utils/resumeAdapterUtils';
import { EditableHeading } from './EditableHeading';
import { AvatarUploader } from './AvatarUploader';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  Settings,
  BookOpen,
  Phone,
  Mail,
  Globe,
  MapPin,
  Plus,
  Palette,
  Type,
  Smartphone,
  MoveVertical,
  LayoutGrid,
  MoveHorizontal,
  Languages,
  Lightbulb,
  Medal,
  HandHeart,
  ArrowDownUp,
} from 'lucide-react';

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
  const [sectionsOrder, setSectionsOrder] = useState<string[]>([
    'personal', 'experience', 'education', 'skills', 'projects'
  ]);
  
  const handleColorChange = (colorType: 'primaryColor' | 'secondaryColor' | 'accentColor' | 'textColor' | 'backgroundColor', color: string) => {
    onCustomizationChange({
      ...customization,
      [colorType]: color
    });
  };
  
  const handleFontFamilyChange = (value: string) => {
    onCustomizationChange({
      ...customization,
      fontFamily: value
    });
  };
  
  const handleFontSizeChange = (value: string) => {
    onCustomizationChange({
      ...customization,
      fontSize: value
    });
  };
  
  const handleSpacingChange = (value: string) => {
    onCustomizationChange({
      ...customization,
      spacing: value
    });
  };
  
  const handleLayoutChange = (value: string) => {
    onCustomizationChange({
      ...customization,
      layoutType: value as 'standard' | 'compact' | 'minimal' | 'creative'
    });
  };

  const handleHeadingStyleChange = (value: string) => {
    onCustomizationChange({
      ...customization,
      headingStyle: value as 'bold' | 'underlined' | 'capitalized' | 'minimal'
    });
  };

  const handleImageChange = (imageData: { src: string | null; size: number; shape: 'circle' | 'square' | 'rounded'; }) => {
    onCustomizationChange({
      ...customization,
      profileImage: imageData
    });
  };

  const handleSectionMove = (sectionId: string, direction: 'up' | 'down') => {
    const index = sectionsOrder.indexOf(sectionId);
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === sectionsOrder.length - 1)
    ) {
      return;
    }
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newOrder = [...sectionsOrder];
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    
    setSectionsOrder(newOrder);
    if (onSectionOrderChange) {
      onSectionOrderChange(newOrder);
    }
  };

  const handleSectionTitleChange = (sectionId: string, newTitle: string) => {
    if (onSectionTitleChange) {
      onSectionTitleChange(sectionId, newTitle);
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
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Customize Your Resume</h2>
      <p className="text-muted-foreground">
        Personalize your resume to match your style and make it stand out.
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="colors"><Palette className="h-4 w-4 mr-1" /> Colors</TabsTrigger>
          <TabsTrigger value="fonts"><Type className="h-4 w-4 mr-1" /> Fonts</TabsTrigger>
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
                  <div className="grid grid-cols-5 gap-2">
                    {colorPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => applyColorPreset(preset)}
                        className="flex flex-col items-center gap-1 p-2 border rounded-md hover:bg-muted transition-colors"
                      >
                        <div className="flex gap-1">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.primaryColor }}></div>
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.secondaryColor }}></div>
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.accentColor }}></div>
                        </div>
                        <span className="text-xs truncate max-w-full">{preset.name}</span>
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
                    onValueChange={handleFontSizeChange}
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
                    onValueChange={handleSpacingChange}
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
                    onValueChange={(value) => onCustomizationChange({...customization, sectionMargins: value})}
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
                    onValueChange={(value) => onCustomizationChange({...customization, lineHeight: value})}
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
                
                <div>
                  <AvatarUploader 
                    onImageChange={handleImageChange}
                    currentImage={customization.profileImage}
                  />
                </div>
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
                  {sectionsOrder.map((sectionId, index) => (
                    <EditableHeading
                      key={sectionId}
                      id={sectionId}
                      title={customization.sectionTitles?.[sectionId] || sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}
                      onTitleChange={handleSectionTitleChange}
                      icon={sectionIcons[sectionId as keyof typeof sectionIcons] || null}
                      onMoveUp={index > 0 ? () => handleSectionMove(sectionId, 'up') : undefined}
                      onMoveDown={index < sectionsOrder.length - 1 ? () => handleSectionMove(sectionId, 'down') : undefined}
                    />
                  ))}
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <Label className="block mb-2">Add Sections</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['languages', 'interests', 'certifications', 'volunteer'].map(section => (
                      <Button
                        key={section}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!sectionsOrder.includes(section)) {
                            const newOrder = [...sectionsOrder, section];
                            setSectionsOrder(newOrder);
                            if (onSectionOrderChange) {
                              onSectionOrderChange(newOrder);
                            }
                          }
                        }}
                        disabled={sectionsOrder.includes(section)}
                        className="justify-start"
                      >
                        {sectionIcons[section as keyof typeof sectionIcons]}
                        <span className="ml-2">{section.charAt(0).toUpperCase() + section.slice(1)}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
