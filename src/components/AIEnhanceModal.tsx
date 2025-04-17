
import { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { enhanceWithGemini, availableModels } from "@/utils/geminiApi";

interface AIEnhanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  prompt: string;
  currentText: string;
  onApply: (enhancedText: string) => void;
}

export function AIEnhanceModal({
  isOpen,
  onClose,
  title,
  description,
  prompt,
  currentText,
  onApply
}: AIEnhanceModalProps) {
  // Use the provided API key by default, or get from localStorage if available
  const savedApiKey = localStorage.getItem("gemini_api_key");
  const [apiKey, setApiKey] = useState<string>(savedApiKey || "");
  const [enhancedText, setEnhancedText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  
  const handleEnhance = async () => {
    setIsGenerating(true);
    setError("");
    
    try {
      // If user entered a custom API key, store it for future use
      if (apiKey && apiKey.trim() !== "") {
        localStorage.setItem("gemini_api_key", apiKey);
      }
      
      // Use provided API key or default one from the utility
      const result = await enhanceWithGemini(prompt, apiKey || undefined);
      
      if (result.error) {
        setError(result.error);
        toast.error("AI enhancement failed", {
          description: result.error
        });
      } else {
        setEnhancedText(result.text);
      }
    } catch (err) {
      setError("Failed to connect to AI service");
      toast.error("AI enhancement failed");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleApply = () => {
    onApply(enhancedText);
    onClose();
    toast.success("AI enhancement applied successfully");
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Gemini API Key (Optional)</label>
            <Input 
              type="password" 
              placeholder="Enter custom Gemini API Key (or leave blank to use default)" 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Using Gemini Pro model. Custom key can be obtained from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google AI Studio</a>
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Current Text</label>
              <Textarea 
                value={currentText} 
                readOnly 
                className="h-[200px] resize-none bg-muted" 
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 flex justify-between">
                <span>Enhanced Text</span>
                {isGenerating && <span className="text-muted-foreground text-xs">Generating...</span>}
              </label>
              <Textarea 
                value={enhancedText} 
                onChange={(e) => setEnhancedText(e.target.value)}
                placeholder={isGenerating ? "Generating..." : "AI enhanced content will appear here"}
                className="h-[200px] resize-none" 
              />
            </div>
          </div>
          
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleEnhance}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
            Generate with AI
          </Button>
          <Button
            variant="default"
            onClick={handleApply}
            disabled={isGenerating || !enhancedText}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
