
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { ResumeTemplatePreview } from "@/components/ResumeTemplatePreview";

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: {
    id: number;
    name: string;
    description: string;
    category: string;
    templateKey?: string;
    image?: string;
  };
  onCustomize?: (templateId: number) => void;
}

const TemplatePreviewModal = ({ isOpen, onClose, template, onCustomize }: TemplatePreviewModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{template.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="aspect-[3/4] relative rounded-lg overflow-hidden border bg-white">
              {template.templateKey ? (
                <ResumeTemplatePreview templateKey={template.templateKey} className="w-full h-full" />
              ) : template.image ? (
                <img src={template.image} alt={template.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">Preview</div>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">About this template</h3>
              <p className="text-muted-foreground">{template.description}</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Category</h3>
              <span className="inline-block px-3 py-1 bg-muted rounded-full text-sm">{template.category}</span>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">✓ ATS-Optimized layout</li>
                <li className="flex items-center gap-2">✓ Customizable colors & fonts</li>
                <li className="flex items-center gap-2">✓ Drag & drop section reorder</li>
                <li className="flex items-center gap-2">✓ PDF export ready</li>
              </ul>
            </div>
            
            <div className="flex flex-col gap-2 pt-4">
              <Link to={`/resume-builder?template=${template.id}`}>
                <Button className="w-full">Use This Template</Button>
              </Link>
              {onCustomize && (
                <Button variant="outline" className="w-full" onClick={() => onCustomize(template.id)}>
                  Customize First
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplatePreviewModal;
