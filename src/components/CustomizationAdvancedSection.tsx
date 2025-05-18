
import React from 'react';
import { ColorPicker } from '@/components/ColorPicker';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ResumeData } from '@/utils/types';

interface CustomizationAdvancedSectionProps {
  customization: ResumeData["customization"];
  onCustomizationChange: (customization: ResumeData["customization"]) => void;
}

const presetColors = [
  '#2563eb', '#6b7280', '#FFD700', '#FF6B6B', '#4CAF50', '#B03060',
  '#003366', '#333333', '#FF9100', '#e5deff', '#D3E4FD', '#1EAEDB', '#1A1F2C'
];

const fontFamilies = [
  { label: 'Sans (system default)', value: 'sans-serif' },
  { label: 'Serif', value: 'serif' },
  { label: 'Mono', value: 'monospace' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' }
];

const fontSizes = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' }
];

const spacings = [
  { label: 'Compact', value: 'compact' },
  { label: 'Normal', value: 'normal' },
  { label: 'Spacious', value: 'spacious' }
];

const layouts = [
  { label: 'Standard', value: 'standard' },
  { label: 'Compact', value: 'compact' },
  { label: 'Minimal', value: 'minimal' },
  { label: 'Creative', value: 'creative' }
];

export const CustomizationAdvancedSection: React.FC<CustomizationAdvancedSectionProps> = ({
  customization,
  onCustomizationChange
}) => {

  const updateField = (key: keyof ResumeData["customization"], value: any) => {
    onCustomizationChange({
      ...customization,
      [key]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <ColorPicker
          label="Primary Color"
          color={customization.primaryColor}
          presetColors={presetColors}
          onChange={color => updateField('primaryColor', color)}
        />
        <ColorPicker
          label="Secondary Color"
          color={customization.secondaryColor || ''}
          presetColors={presetColors}
          onChange={color => updateField('secondaryColor', color)}
        />
        <ColorPicker
          label="Accent Color"
          color={customization.accentColor || ''}
          presetColors={presetColors}
          onChange={color => updateField('accentColor', color)}
        />
        <ColorPicker
          label="Background Color"
          color={customization.backgroundColor || ''}
          presetColors={presetColors}
          onChange={color => updateField('backgroundColor', color)}
        />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-xs font-semibold">Font Family</label>
          <select
            className="w-full border rounded px-3 py-2 text-sm bg-background"
            value={customization.fontFamily || 'sans-serif'}
            onChange={e => updateField('fontFamily', e.target.value)}
          >
            {fontFamilies.map(ff => (
              <option value={ff.value} key={ff.value}>{ff.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 text-xs font-semibold">Font Size</label>
          <select
            className="w-full border rounded px-3 py-2 text-sm bg-background"
            value={customization.fontSize || 'medium'}
            onChange={e => updateField('fontSize', e.target.value)}
          >
            {fontSizes.map(fz => (
              <option value={fz.value} key={fz.value}>{fz.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 text-xs font-semibold">Spacing</label>
          <select
            className="w-full border rounded px-3 py-2 text-sm bg-background"
            value={customization.spacing || 'normal'}
            onChange={e => updateField('spacing', e.target.value)}
          >
            {spacings.map(s => (
              <option value={s.value} key={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 text-xs font-semibold">Layout Type</label>
          <select
            className="w-full border rounded px-3 py-2 text-sm bg-background"
            value={customization.layoutType || 'standard'}
            onChange={e => updateField('layoutType', e.target.value)}
          >
            {layouts.map(l => (
              <option value={l.value} key={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-4 mt-2">
        <Button
          variant={customization.showPhoto ? "default" : "outline"}
          type="button"
          onClick={() => updateField('showPhoto', !customization.showPhoto)}
        >
          {customization.showPhoto ? "Hide Profile Photo" : "Show Profile Photo"}
        </Button>
      </div>
    </div>
  );
};

export default CustomizationAdvancedSection;

