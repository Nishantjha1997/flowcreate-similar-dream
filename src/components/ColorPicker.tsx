
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Check } from 'lucide-react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  presetColors?: string[];
}

export const ColorPicker = ({ 
  color, 
  onChange, 
  presetColors = ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff'] 
}: ColorPickerProps) => {
  const [inputColor, setInputColor] = useState(color);
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputColor(e.target.value);
    onChange(e.target.value);
  };
  
  const handlePresetClick = (presetColor: string) => {
    setInputColor(presetColor);
    onChange(presetColor);
  };
  
  const isSelected = (presetColor: string) => {
    return color.toLowerCase() === presetColor.toLowerCase();
  };

  return (
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
            <span>{color}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="space-y-3">
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
          
          <div className="grid grid-cols-5 gap-2">
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
        </div>
      </PopoverContent>
    </Popover>
  );
};
