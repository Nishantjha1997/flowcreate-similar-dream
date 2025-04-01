import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, ChevronDown, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  presetColors?: string[];
  showRecentColors?: boolean;
  label?: string;
}

export const ColorPicker = ({ 
  color, 
  onChange, 
  presetColors = ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff'],
  showRecentColors = true,
  label
}: ColorPickerProps) => {
  const [inputColor, setInputColor] = useState(color);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('preset');
  
  useEffect(() => {
    setInputColor(color);
  }, [color]);
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputColor(e.target.value);
    onChange(e.target.value);
    addToRecentColors(e.target.value);
  };
  
  const handlePresetClick = (presetColor: string) => {
    setInputColor(presetColor);
    onChange(presetColor);
    addToRecentColors(presetColor);
  };
  
  const addToRecentColors = (newColor: string) => {
    if (showRecentColors) {
      setRecentColors(prev => {
        const filteredColors = prev.filter(c => c.toLowerCase() !== newColor.toLowerCase());
        return [newColor, ...filteredColors].slice(0, 8);
      });
    }
  };
  
  const isSelected = (presetColor: string) => {
    return color.toLowerCase() === presetColor.toLowerCase();
  };

  const resetToDefault = () => {
    const defaultColor = presetColors[0];
    setInputColor(defaultColor);
    onChange(defaultColor);
  };

  return (
    <div className="space-y-1.5">
      {label && <Label>{label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full flex justify-between items-center h-10"
          >
            <div className="flex items-center">
              <div 
                className="h-6 w-6 rounded-md mr-2 border border-gray-200"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm">{color}</span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-3">
              <TabsTrigger value="preset">Presets</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
            
            <TabsContent value="preset" className="space-y-3">
              <div className="grid grid-cols-8 gap-2">
                {presetColors.map((presetColor) => (
                  <button
                    key={presetColor}
                    className={`h-7 w-7 rounded-md border cursor-pointer transition-transform relative ${isSelected(presetColor) ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-gray-200 hover:scale-110'}`}
                    style={{ backgroundColor: presetColor }}
                    onClick={() => handlePresetClick(presetColor)}
                    title={presetColor}
                  >
                    {isSelected(presetColor) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white drop-shadow-md" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              {showRecentColors && recentColors.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Recent Colors</Label>
                  <div className="grid grid-cols-8 gap-2">
                    {recentColors.map((recentColor, index) => (
                      <button
                        key={`${recentColor}-${index}`}
                        className={`h-7 w-7 rounded-md border cursor-pointer transition-transform relative ${isSelected(recentColor) ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-gray-200 hover:scale-110'}`}
                        style={{ backgroundColor: recentColor }}
                        onClick={() => handlePresetClick(recentColor)}
                        title={recentColor}
                      >
                        {isSelected(recentColor) && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className="h-4 w-4 text-white drop-shadow-md" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="custom" className="space-y-3">
              <div className="flex items-center">
                <div 
                  className="h-10 w-10 rounded mr-2 border border-gray-200"
                  style={{ backgroundColor: inputColor }}
                />
                <Input
                  type="text"
                  value={inputColor}
                  onChange={(e) => setInputColor(e.target.value)}
                  onBlur={() => onChange(inputColor)}
                  className="flex-1"
                  placeholder="#000000"
                />
              </div>
              
              <div>
                <Input
                  type="color"
                  value={inputColor}
                  onChange={handleColorChange}
                  className="w-full h-10"
                />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={resetToDefault}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Reset to Default
              </Button>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
    </div>
  );
};
