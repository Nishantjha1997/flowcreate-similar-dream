
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TemplateCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateName?: string;
  onStart?: () => void;
}

const TemplateCustomizationModal = ({ isOpen, onClose, templateName, onStart }: TemplateCustomizationModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Customize {templateName || "Template"}</DialogTitle>
        </DialogHeader>
        <div className="py-6 space-y-6">
          <p className="text-muted-foreground text-center">
            Here you will soon be able to adjust colors, font, and layout <br />
            (This is a placeholder for the template customization flow).
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={onStart}>
              Start Editing Resume
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateCustomizationModal;

