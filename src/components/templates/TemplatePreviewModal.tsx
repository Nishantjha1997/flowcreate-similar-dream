
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Download, Eye } from "lucide-react";

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: {
    id: number;
    name: string;
    description: string;
    image: string;
    category: string;
  };
}

const TemplatePreviewModal = ({ isOpen, onClose, template }: TemplatePreviewModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{template.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="aspect-[3/4] relative rounded-lg overflow-hidden">
              <img 
                src={template.image} 
                alt={template.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Eye className="mr-2 h-4 w-4" /> Preview PDF
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Download className="mr-2 h-4 w-4" /> Download Sample
              </Button>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">About this template</h3>
              <p className="text-muted-foreground">{template.description}</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Features</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>ATS-friendly formatting</li>
                <li>Professional typography</li>
                <li>Customizable sections</li>
                <li>Mobile-responsive design</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Best for</h3>
              <p className="text-muted-foreground">
                {template.category} roles and professionals looking for a {template.category.toLowerCase()} approach.
              </p>
            </div>
            
            <Link to={`/resume-builder?template=${template.id}`} className="block">
              <Button className="w-full">Use this template</Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplatePreviewModal;
