
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorPicker } from './ColorPicker';
import { ResumeData } from '@/utils/resumeTemplates';

interface CustomizationPanelProps {
  customization: ResumeData['customization'];
  onCustomizationChange: (customization: ResumeData['customization']) => void;
}

export const CustomizationPanel = ({ 
  customization = {}, 
  onCustomizationChange 
}: CustomizationPanelProps) => {
  const [activeTab, setActiveTab] = useState('colors');
  
  const handleColorChange = (colorType: 'primaryColor' | 'secondaryColor', color: string) => {
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Customize Your Resume</h2>
      <p className="text-muted-foreground">
        Personalize your resume to match your style and make it stand out.
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="fonts">Fonts</TabsTrigger>
          <TabsTrigger value="spacing">Spacing</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
        </TabsList>
        
        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div>
                  <Label className="block mb-2">Primary Color</Label>
                  <ColorPicker 
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
                </div>
                
                <div>
                  <Label className="block mb-2">Secondary Color</Label>
                  <ColorPicker 
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
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fonts" className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-6">
                <div>
                  <Label className="block mb-2">Font Family</Label>
                  <RadioGroup 
                    value={customization.fontFamily || 'default'}
                    onValueChange={handleFontFamilyChange}
                    className="grid grid-cols-1 gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="default" id="font-default" />
                      <Label htmlFor="font-default" className="font-normal">Template Default</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="'Roboto', sans-serif" id="font-roboto" />
                      <Label htmlFor="font-roboto" className="font-['Roboto']">Roboto</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="'Montserrat', sans-serif" id="font-montserrat" />
                      <Label htmlFor="font-montserrat" className="font-['Montserrat']">Montserrat</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="'Georgia', serif" id="font-georgia" />
                      <Label htmlFor="font-georgia" className="font-['Georgia']">Georgia</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="'Poppins', sans-serif" id="font-poppins" />
                      <Label htmlFor="font-poppins" className="font-['Poppins']">Poppins</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="'Roboto Mono', monospace" id="font-mono" />
                      <Label htmlFor="font-mono" className="font-['Roboto_Mono']">Roboto Mono</Label>
                    </div>
                  </RadioGroup>
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="spacing" className="space-y-4">
          <Card>
            <CardContent className="pt-4">
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
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardContent className="pt-4">
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
