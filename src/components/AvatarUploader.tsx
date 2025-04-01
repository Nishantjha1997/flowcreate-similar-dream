
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Upload, 
  XCircle, 
  CropIcon, 
  ZoomIn, 
  CircleIcon, 
  SquareIcon,
  Circle,
  Square
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AvatarUploaderProps {
  onImageChange: (imageData: {
    src: string | null;
    size: number;
    shape: 'circle' | 'square' | 'rounded';
  }) => void;
  currentImage?: {
    src: string | null;
    size: number;
    shape: 'circle' | 'square' | 'rounded';
  };
}

export const AvatarUploader = ({ 
  onImageChange, 
  currentImage = { src: null, size: 150, shape: 'circle' as const }
}: AvatarUploaderProps) => {
  const [image, setImage] = useState<string | null>(currentImage.src);
  const [size, setSize] = useState(currentImage.size);
  const [shape, setShape] = useState<'circle' | 'square' | 'rounded'>(currentImage.shape);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setImage(imageData);
        onImageChange({ src: imageData, size, shape });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    onImageChange({ src: null, size, shape });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSizeChange = (value: number[]) => {
    const newSize = value[0];
    setSize(newSize);
    onImageChange({ src: image, size: newSize, shape });
  };

  const handleShapeChange = (value: 'circle' | 'square' | 'rounded') => {
    setShape(value);
    onImageChange({ src: image, size, shape: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Profile Photo</Label>
        <div className="flex items-center gap-4">
          <div 
            className={`
              bg-muted flex items-center justify-center relative overflow-hidden
              ${shape === 'circle' ? 'rounded-full' : ''}
              ${shape === 'square' ? '' : ''}
              ${shape === 'rounded' ? 'rounded-md' : ''}
            `}
            style={{ 
              width: `${Math.min(150, size)}px`, 
              height: `${Math.min(150, size)}px` 
            }}
          >
            {image ? (
              <>
                <img 
                  src={image} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-75 hover:opacity-100"
                  onClick={handleRemoveImage}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Upload className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex-1 space-y-4">
            <input
              type="file"
              id="profile-photo"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              {image ? 'Change Photo' : 'Upload Photo'}
            </Button>
            
            {image && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs">Size</Label>
                    <span className="text-xs text-muted-foreground">{size}px</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ZoomIn className="h-4 w-4 text-muted-foreground" />
                    <Slider
                      value={[size]}
                      min={50}
                      max={200}
                      step={5}
                      onValueChange={handleSizeChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Shape</Label>
                  <Select
                    value={shape}
                    onValueChange={(value: 'circle' | 'square' | 'rounded') => handleShapeChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select shape" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="circle" className="flex items-center gap-2">
                        <Circle className="h-4 w-4 mr-2" /> Circle
                      </SelectItem>
                      <SelectItem value="square" className="flex items-center gap-2">
                        <Square className="h-4 w-4 mr-2" /> Square
                      </SelectItem>
                      <SelectItem value="rounded" className="flex items-center gap-2">
                        <Square className="h-4 w-4 mr-2 rounded-md" /> Rounded
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
