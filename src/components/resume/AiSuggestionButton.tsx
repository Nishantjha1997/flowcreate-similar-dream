
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Lightbulb, Crown, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { fetchGeminiSuggestions, SuggestionType, ResumeSection } from "@/utils/ai/gemini";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AiSuggestionButtonProps {
  value: string;
  onAccept: (suggested: string) => void;
  label?: string;
  isPremium?: boolean;
  onUpsell?: () => void;
  section: ResumeSection;
  jobTitle?: string;
  company?: string;
  additionalContext?: string;
}

export const AiSuggestionButton: React.FC<AiSuggestionButtonProps> = ({
  value,
  onAccept,
  label = "Get AI Suggestions",
  isPremium = false,
  onUpsell,
  section,
  jobTitle,
  company,
  additionalContext
}) => {
  const [loading, setLoading] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [suggestionType, setSuggestionType] = useState<SuggestionType>('bullet');

  const getSuggestionTypeLabel = (type: SuggestionType) => {
    switch (type) {
      case 'bullet': return 'Bullet Points';
      case 'paragraph': return 'Paragraph';
      case 'concise': return 'Concise';
      default: return 'Bullet Points';
    }
  };

  const getSectionSpecificTypes = (section: ResumeSection): SuggestionType[] => {
    switch (section) {
      case 'skills':
        return ['bullet', 'concise'];
      default:
        return ['bullet', 'paragraph', 'concise'];
    }
  };

  async function handleGenerate() {
    if (!isPremium) {
      setShowUpgradeDialog(true);
      return;
    }

    if (!value.trim()) {
      toast.error("Please enter some content first to get AI suggestions.");
      return;
    }

    setLoading(true);
    setSuggestions([]);
    toast.info("Generating AI suggestions...");
    
    try {
      const results = await fetchGeminiSuggestions({
        content: value,
        section,
        suggestionType,
        jobTitle,
        company,
        additionalContext
      });
      
      setSuggestions(results);
      toast.success(`Generated ${results.length} AI suggestions!`);
      console.log("[Gemini] AI suggestions:", results);
    } catch (e: any) {
      toast.error(e.message || "Failed to get AI suggestions");
      console.error("[Gemini] Suggestion error:", e);
    }
    setLoading(false);
  }

  function handleAccept(suggestion: string) {
    onAccept(suggestion);
    setSuggestions([]);
    toast.success("Suggestion applied!");
  }

  const handleUpgrade = () => {
    setShowUpgradeDialog(false);
    toast.info("Premium upgrade coming soon! Get unlimited resumes + AI features for ₹199/month");
    if (onUpsell) onUpsell();
  };

  const availableTypes = getSectionSpecificTypes(section);

  return (
    <>
      <div className="mt-2 space-y-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={isPremium ? "secondary" : "outline"}
            onClick={handleGenerate}
            disabled={loading}
            className={`flex items-center gap-1 ${!isPremium ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-50' : ''}`}
          >
            {loading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : isPremium ? (
              <Lightbulb className="h-4 w-4 text-yellow-500" />
            ) : (
              <Crown className="h-4 w-4 text-yellow-600" />
            )}
            {loading ? "Generating..." : label}
          </Button>
          
          {isPremium && availableTypes.length > 1 && (
            <Select value={suggestionType} onValueChange={(value: SuggestionType) => setSuggestionType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getSuggestionTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <span className="text-xs text-muted-foreground">
          {isPremium ? "Powered by Gemini AI - Multiple suggestions available" : "Premium Feature - ₹199/month"}
        </span>
        
        {suggestions.length > 0 && (
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="bg-primary/5 border border-primary/20 rounded-md p-3 text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-primary">
                    AI Suggestion {index + 1} ({getSuggestionTypeLabel(suggestionType)})
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      type="button" 
                      onClick={() => handleAccept(suggestion)}
                      className="text-xs"
                    >
                      Use This
                    </Button>
                  </div>
                </div>
                <div className="whitespace-pre-wrap text-sm text-muted-foreground mb-2">
                  {suggestion}
                </div>
              </div>
            ))}
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="ghost" 
                type="button" 
                onClick={() => setSuggestions([])}
                className="text-xs"
              >
                Clear All
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                type="button" 
                onClick={handleGenerate}
                disabled={loading}
                className="text-xs flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Generate New
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Premium Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              Upgrade to Premium
            </DialogTitle>
            <DialogDescription className="space-y-4">
              <p className="text-base">
                Unlock powerful AI features to supercharge your resume!
              </p>
              
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">Premium AI Benefits:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>✨ Multiple AI suggestion formats (bullets, paragraphs, concise)</li>
                  <li>🎯 Context-aware suggestions for each resume section</li>
                  <li>📊 Achievement-focused, quantifiable content</li>
                  <li>🔄 Unlimited regeneration and refinement</li>
                  <li>📄 Unlimited resume saves & cloud backup</li>
                  <li>🚀 Priority support</li>
                </ul>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-primary">₹199/month</div>
                <div className="text-sm text-muted-foreground">Cancel anytime</div>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 mt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowUpgradeDialog(false)}
            >
              Maybe Later
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
              onClick={handleUpgrade}
            >
              Upgrade Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
