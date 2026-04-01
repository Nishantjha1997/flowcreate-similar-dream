import React, { useState, useCallback } from 'react';
import { ResumeVisualPreview } from '@/components/resume/ResumeVisualPreview';
import { ResumeData } from '@/utils/types';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2,
  RotateCcw,
  Download
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useDesignMode } from '@/hooks/useDesignMode';
import { cn } from '@/lib/utils';

interface ResumePreviewSectionProps {
  resume: ResumeData;
  templateId: string;
  templateNames: Record<string, string>;
  resumeRef: React.RefObject<HTMLDivElement>;
  sectionOrder: string[];
  hiddenSections: string[];
  onDownload?: () => void;
}

export const ResumePreviewSection = ({ 
  resume, 
  templateId, 
  templateNames,
  resumeRef,
  sectionOrder,
  hiddenSections,
  onDownload
}: ResumePreviewSectionProps) => {
  const [zoom, setZoom] = useState(70);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { isNeoBrutalism } = useDesignMode();
  
  const zoomIn = useCallback(() => setZoom(prev => Math.min(prev + 10, 150)), []);
  const zoomOut = useCallback(() => setZoom(prev => Math.max(prev - 10, 30)), []);
  const resetZoom = useCallback(() => setZoom(70), []);
  const toggleFullscreen = useCallback(() => setIsFullscreen(prev => !prev), []);

  return (
    <div className={cn(
      "h-full flex flex-col rounded-2xl border border-border/50 bg-card overflow-hidden transition-all duration-300 shadow-sm",
      isFullscreen && "fixed inset-4 z-50 shadow-2xl bg-card",
      isNeoBrutalism && "border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-none"
    )}>
      {/* Toolbar */}
      <div className={cn(
        "flex-shrink-0 px-4 py-2 border-b border-border/30 bg-muted/10 flex items-center justify-between",
        isNeoBrutalism && "border-b-2 border-foreground bg-accent/20"
      )}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
          </div>
          <span className="text-[11px] font-medium text-muted-foreground ml-1.5 tracking-wide">Preview</span>
        </div>
        
        {/* Zoom Controls */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground" onClick={zoomOut} disabled={zoom <= 30}>
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Zoom Out</TooltipContent>
          </Tooltip>
          
          <div className="w-20 mx-1">
            <Slider value={[zoom]} onValueChange={([value]) => setZoom(value)} min={30} max={150} step={5} className="h-1" />
          </div>
          
          <span className="text-[10px] text-muted-foreground w-8 text-center tabular-nums font-medium">{zoom}%</span>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground" onClick={zoomIn} disabled={zoom >= 150}>
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Zoom In</TooltipContent>
          </Tooltip>
          
          <div className="w-px h-4 bg-border/30 mx-1" />
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground" onClick={resetZoom}>
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Reset Zoom</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</TooltipContent>
          </Tooltip>
          
          {onDownload && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground" onClick={onDownload}>
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Download PDF</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
      
      {/* Preview Canvas */}
      <div className={cn(
        "flex-1 overflow-auto p-6 min-h-[500px]",
        "bg-[hsl(var(--muted)/0.15)]",
        isNeoBrutalism && "bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,hsl(var(--muted)/0.1)_10px,hsl(var(--muted)/0.1)_20px)]"
      )}>
        <div 
          className="transition-transform duration-300 ease-out origin-top"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
        >
          <div 
            className={cn(
              "resume-container bg-white rounded-xl mx-auto transition-shadow duration-300",
              "shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.06)]",
              "hover:shadow-[0_2px_8px_rgba(0,0,0,0.06),0_16px_48px_rgba(0,0,0,0.1)]",
              isNeoBrutalism && "border-2 border-foreground shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-none"
            )}
            style={{ width: '210mm', minHeight: '297mm' }}
            id="resume-preview-container" 
            ref={resumeRef}
          >
            <ResumeVisualPreview 
              resume={resume}
              templateId={templateId}
              templateNames={templateNames}
              sectionOrder={sectionOrder}
              hiddenSections={hiddenSections}
            />
          </div>
        </div>
      </div>
      
      {isFullscreen && (
        <button
          className="absolute top-3 right-3 p-2 bg-background/90 backdrop-blur-sm rounded-xl hover:bg-background transition-colors border border-border/40 shadow-sm"
          onClick={toggleFullscreen}
        >
          <Minimize2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
