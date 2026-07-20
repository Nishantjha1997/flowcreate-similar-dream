
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ColorPicker } from './ColorPicker';
import { ResumeData } from '@/utils/types';
import { getTemplate, resolveTemplateKey } from '@/templates/registry';
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
  RotateCcw,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

interface CustomizationPanelProps {
  customization: ResumeData["customization"];
  onCustomizationChange: (customization: ResumeData["customization"]) => void;
  resumeData: ResumeData;
  compact?: boolean;
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

const accentColors = [
  '#2563eb', '#4f46e5', '#7c3aed', '#db2777',
  '#dc2626', '#ea580c', '#d97706', '#16a34a',
  '#0d9488', '#0ea5e9', '#64748b', '#111827'
];

interface ColorPreset {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  backgroundColor: string;
}

const fontPairOptions = [
  {
    value: "inter-inter",
    label: "Inter / Inter",
    headingFont: "'Inter', sans-serif",
    bodyFont: "'Inter', sans-serif"
  },
  {
    value: "georgia-inter",
    label: "Georgia / Inter",
    headingFont: "Georgia, serif",
    bodyFont: "'Inter', sans-serif"
  },
  {
    value: "playfair-arial",
    label: "Playfair Display / Arial",
    headingFont: "'Playfair Display', Georgia, serif",
    bodyFont: "Arial, sans-serif"
  },
  {
    value: "arial-arial",
    label: "Arial / Arial",
    headingFont: "Arial, sans-serif",
    bodyFont: "Arial, sans-serif"
  },
  {
    value: "times-times",
    label: "Times New Roman / Times New Roman",
    headingFont: "'Times New Roman', Times, serif",
    bodyFont: "'Times New Roman', Times, serif"
  },
  {
    value: "segoe-segoe",
    label: "Segoe UI / Segoe UI",
    headingFont: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    bodyFont: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  }
];

export const CustomizationPanel = ({ 
  customization = { primaryColor: '#2563eb' }, // Provide a default primaryColor 
  onCustomizationChange,
  resumeData,
  compact = false
}: CustomizationPanelProps) => {
  const [activeTab, setActiveTab] = useState('colors');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const templateDef = getTemplate(resolveTemplateKey(resumeData.selectedTemplate));
  const supportsPhoto = templateDef?.supportsPhoto !== false;
  const panelCardClass = compact ? 'border-0 bg-transparent shadow-none' : undefined;
  const panelContentClass = compact ? 'px-0 pt-0' : 'pt-4';

  const handleResetDesign = () => {
    onCustomizationChange({
      primaryColor: templateDef.defaultAccent,
      secondaryColor: '#6b7280',
      fontSize: 'medium',
      spacing: 'normal',
      sectionsOrder: customization.sectionsOrder,
      hiddenSections: customization.hiddenSections,
      sectionTitles: customization.sectionTitles,
    });
    setHasUnsavedChanges(true);
    toast.success('Template design reset');
  };
  
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
      fontFamily: value,
      headingFont: undefined,
      bodyFont: undefined
    });
    setHasUnsavedChanges(true);
  };

  const handleFontPairChange = (value: string) => {
    const pair = fontPairOptions.find(p => p.value === value);
    if (pair) {
      onCustomizationChange({
        ...customization,
        headingFont: pair.headingFont,
        bodyFont: pair.bodyFont,
        fontFamily: 'default'
      });
      setHasUnsavedChanges(true);
    }
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

  const colorPresets: ColorPreset[] = [
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

  const applyColorPreset = (preset: ColorPreset) => {
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

  const currentFontPairValue = fontPairOptions.find(
    pair => pair.headingFont === customization.headingFont && pair.bodyFont === customization.bodyFont
  )?.value || '';

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <div className="flex items-center justify-between mb-2">
        <div className="min-w-0">
          <h2 className={compact ? "text-sm font-semibold" : "text-xl font-semibold"}>Design</h2>
          {compact && (
            <p className="truncate text-[10px] text-muted-foreground">
              {templateDef.name} · changes apply to this resume
            </p>
          )}
        </div>
        <div className="ml-2 flex shrink-0 items-center gap-2">
          {hasUnsavedChanges && (
            <div className="flex items-center text-[10px] font-medium text-primary">
              <Check className="w-3 h-3 mr-1" /> Applied
            </div>
          )}
          <button
            type="button"
            onClick={handleResetDesign}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Reset template design"
            aria-label="Reset template design"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      
      {!compact && (
        <p className="text-muted-foreground">
          Personalize your resume to match your style and make it stand out.
        </p>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid h-auto gap-1 mb-4 ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
          <TabsTrigger value="colors"><Palette className="h-4 w-4 mr-1" /> Colors</TabsTrigger>
          <TabsTrigger value="fonts"><Type className="h-4 w-4 mr-1" /> Type</TabsTrigger>
          <TabsTrigger value="spacing"><MoveHorizontal className="h-4 w-4 mr-1" /> Spacing</TabsTrigger>
          <TabsTrigger value="layout"><LayoutGrid className="h-4 w-4 mr-1" /> Layout</TabsTrigger>
        </TabsList>
        
        <TabsContent value="colors" className="space-y-4">
          <Card className={panelCardClass}>
            <CardContent className={panelContentClass}>
              <div className={compact ? 'space-y-5' : 'space-y-6'}>
                <div>
                  <Label className="block mb-3">Color Presets</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {colorPresets.map((preset, idx) => {
                      const selected = customization.primaryColor?.toLowerCase() === preset.primaryColor.toLowerCase()
                        && customization.accentColor?.toLowerCase() === preset.accentColor.toLowerCase();
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => applyColorPreset(preset)}
                          className={`flex min-w-0 items-center gap-2 rounded-lg border p-2 text-left transition-colors hover:bg-muted ${selected ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border/50'}`}
                          title={preset.name}
                          aria-pressed={selected}
                        >
                          <div className="flex shrink-0 -space-x-1">
                            <div className="h-4 w-4 rounded-full border border-background" style={{ backgroundColor: preset.primaryColor }} />
                            <div className="h-4 w-4 rounded-full border border-background" style={{ backgroundColor: preset.secondaryColor }} />
                            <div className="h-4 w-4 rounded-full border border-background" style={{ backgroundColor: preset.accentColor }} />
                          </div>
                          <span className="truncate text-[10px] font-medium">{preset.name}</span>
                          {selected && <Check className="ml-auto h-3 w-3 shrink-0 text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="block mb-3">Accent Presets</Label>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {accentColors.map((color) => {
                      const isSelected = (customization.primaryColor || '#2563eb').toLowerCase() === color.toLowerCase();
                      return (
                        <button
                          key={color}
                          onClick={() => handleColorChange('primaryColor', color)}
                          className={`h-8 w-8 rounded-full border cursor-pointer transition-transform relative ${isSelected ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-border hover:scale-110'}`}
                          style={{ backgroundColor: color }}
                          title={color}
                        >
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check className="h-4 w-4 text-white drop-shadow-md" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="block mb-3">Custom Colors</Label>
                  <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-2'}`}>
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
                
                <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-2'}`}>
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
          <Card className={panelCardClass}>
            <CardContent className={panelContentClass}>
              <div className={compact ? 'space-y-5' : 'space-y-6'}>
                <div>
                  <Label className="block mb-2">Font Pairing Presets</Label>
                  <Select
                    value={currentFontPairValue}
                    onValueChange={handleFontPairChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select font pairing" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontPairOptions.map(pair => (
                        <SelectItem key={pair.value} value={pair.value}>
                          {pair.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                      <Label htmlFor="style-underlined" className="border-b-2 border-foreground cursor-pointer">Underlined Headings</Label>
                    </div>
                    <div className="border rounded-md p-3 flex items-center space-x-3 hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="capitalized" id="style-capitalized" />
                      <Label htmlFor="style-capitalized" className="uppercase text-sm cursor-pointer">CAPITALIZED HEADINGS</Label>
                    </div>
                    <div className="border rounded-md p-3 flex items-center space-x-3 hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="minimal" id="style-minimal" />
                      <Label htmlFor="style-minimal" className="text-muted-foreground font-light cursor-pointer">Minimal Headings</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="block mb-2">Text Density</Label>
                  <div className="py-5 px-2">
                    <Slider 
                      value={[customization.textDensity ?? 5]}
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
          <Card className={panelCardClass}>
            <CardContent className={panelContentClass}>
              <div className={compact ? 'space-y-5' : 'space-y-6'}>
                <div>
                  <Label className="block mb-2">Content Spacing</Label>
                  <Tabs 
                    value={customization.spacing || 'normal'}
                    onValueChange={(value) => handleSpacingChange(value as 'compact' | 'normal' | 'spacious')}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="compact">Compact</TabsTrigger>
                      <TabsTrigger value="normal">Normal</TabsTrigger>
                      <TabsTrigger value="spacious">Spacious</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                <div>
                  <Label className="block mb-2">Section Margins</Label>
                  <RadioGroup 
                    value={customization.sectionMargins || 'medium'}
                    onValueChange={(value) => {
                      onCustomizationChange({...customization, sectionMargins: value as 'small' | 'medium' | 'large'});
                      setHasUnsavedChanges(true);
                    }}
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
                  <Tabs 
                    value={customization.lineHeight || 'normal'}
                    onValueChange={(value) => {
                      onCustomizationChange({...customization, lineHeight: value as 'tight' | 'normal' | 'relaxed'});
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="tight">1.4 (Tight)</TabsTrigger>
                      <TabsTrigger value="normal">1.6 (Normal)</TabsTrigger>
                      <TabsTrigger value="relaxed">1.8 (Relaxed)</TabsTrigger>
                    </TabsList>
                  </Tabs>
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
          <Card className={panelCardClass}>
            <CardContent className={panelContentClass}>
              <div className={compact ? 'space-y-5' : 'space-y-6'}>
                <div>
                  <Label className="block mb-2">Content Layout</Label>
                  <p className="mb-3 text-[10px] text-muted-foreground">Adjust page density without changing your chosen template.</p>
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
                        <span>Balanced</span>
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
                        <span>Dense</span>
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
                        <span>Airy</span>
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
                        <span>Framed</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {supportsPhoto && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="show-photo" className="cursor-pointer">Show Profile Photo</Label>
                        <Switch 
                          id="show-photo" 
                          checked={customization.showPhoto !== false} 
                          onCheckedChange={handleShowPhotoChange}
                        />
                      </div>
                    </div>
                    
                    {customization.showPhoto !== false && (
                      <div className="space-y-4">
                        <div>
                          <Label className="block mb-2">Photo Shape</Label>
                          <RadioGroup 
                            value={customization.photoShape || 'circle'}
                            onValueChange={(value) => {
                              onCustomizationChange({...customization, photoShape: value as 'circle'|'rounded'|'square'});
                              setHasUnsavedChanges(true);
                            }}
                            className="grid grid-cols-3 gap-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="circle" id="photo-circle" />
                              <Label htmlFor="photo-circle" className="font-normal">Circle</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="rounded" id="photo-rounded" />
                              <Label htmlFor="photo-rounded" className="font-normal">Rounded</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="square" id="photo-square" />
                              <Label htmlFor="photo-square" className="font-normal">Square</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
      </Tabs>
      <p className="text-xs text-muted-foreground">
        Style changes stay with this resume when you save it.
      </p>
    </div>
  );
};
