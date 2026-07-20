import React, { useState, useCallback, useEffect } from 'react';
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
import { A4_WIDTH_PX, A4_HEIGHT_PX } from '@/constants/pdfDimensions';

interface ResumePreviewSectionProps {
  resume: ResumeData;
  templateId: string;
  templateNames: Record<string, string>;
  resumeRef: React.RefObject<HTMLDivElement>;
  sectionOrder: string[];
  hiddenSections: string[];
  onDownload?: () => void;
}

const PageBreakIndicators = ({ containerRef }: { containerRef: React.RefObject<HTMLDivElement> }) => {
  const [pages, setPages] = useState<number[]>([]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const checkHeight = () => {
      const height = el.scrollHeight;
      const pageHeight = A4_HEIGHT_PX;
      // Subtract one pixel so content that fits exactly on a page does not
      // incorrectly display a break and a phantom next page.
      const pageCount = Math.floor(Math.max(0, height - 1) / pageHeight);
      const newPages = [];
      for (let i = 1; i <= pageCount; i++) {
        newPages.push(i);
      }
      setPages((current) =>
        current.length === newPages.length && current.every((value, index) => value === newPages[index])
          ? current
          : newPages,
      );
    };

    checkHeight();
    
    const observer = new ResizeObserver(checkHeight);
    observer.observe(el);
    
    window.addEventListener('resize', checkHeight);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkHeight);
    };
  }, [containerRef]);

  if (pages.length === 0) return null;

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-10"
    >
      {pages.map((pageNum) => {
        const topPos = pageNum * A4_HEIGHT_PX;
        return (
          <div 
            key={pageNum} 
            className="absolute left-0 right-0 flex items-center"
            style={{ top: `${topPos}px`, transform: 'translateY(-50%)' }}
          >
            <div className="w-full border-t-2 border-dashed border-red-400/50" />
            <span className="absolute right-4 bg-red-500 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap uppercase tracking-wider">
              Page {pageNum + 1}
            </span>
          </div>
        );
      })}
    </div>
  );
};

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
          <div className="flex items-center gap-0.5 mr-2 bg-muted/40 p-0.5 rounded-lg border border-border/10">
            {[50, 75, 100, 125].map((z) => (
              <Button
                key={z}
                variant={zoom === z ? 'secondary' : 'ghost'}
                size="sm"
                className="h-6 px-2 text-[10px] rounded-md font-medium transition-all"
                onClick={() => setZoom(z)}
              >
                {z}%
              </Button>
            ))}
          </div>

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
          className="transition-transform duration-300 ease-out origin-top relative"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
        >
          <div 
            className={cn(
              "resume-container bg-white rounded-xl mx-auto transition-shadow duration-300 relative",
              "shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.06)]",
              "hover:shadow-[0_2px_8px_rgba(0,0,0,0.06),0_16px_48px_rgba(0,0,0,0.1)]",
              isNeoBrutalism && "border-2 border-foreground shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-none"
            )}
            style={{ width: `${A4_WIDTH_PX}px`, minHeight: `${A4_HEIGHT_PX}px` }}
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
            <PageBreakIndicators containerRef={resumeRef} />
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
