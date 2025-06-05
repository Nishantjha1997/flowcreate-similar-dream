
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Lightbulb, Crown } from "lucide-react";
import { toast } from "sonner";
import { fetchGeminiSuggestion } from "@/utils/ai/gemini";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AiSuggestionButtonProps {
  value: string;
  onAccept: (suggested: string) => void;
  label?: string;
  isPremium?: boolean;
  onUpsell?: () => void;
}

export const AiSuggestionButton: React.FC<AiSuggestionButtonProps> = ({
  value,
  onAccept,
  label = "Get AI Suggestion",
  isPremium = false,
  onUpsell
}) => {
  const [loading, setLoading] = React.useState(false);
  const [suggestion, setSuggestion] = React.useState<string | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  async function handleGenerate() {
    if (!isPremium) {
      setShowUpgradeDialog(true);
      return;
    }

    setLoading(true);
    setSuggestion(null);
    toast.info("Requesting AI suggestion...");
    try {
      const result = await fetchGeminiSuggestion(value);
      setSuggestion(result);
      toast.success("AI suggestion ready!");
      console.log("[Gemini] AI suggestion:", result);
    } catch (e: any) {
      toast.error(e.message || "Failed to get AI suggestion");
      console.error("[Gemini] Suggestion error:", e);
    }
    setLoading(false);
  }

  function handleAccept() {
    if (suggestion) {
      onAccept(suggestion);
      setSuggestion(null);
      toast.success("Suggestion applied!");
    }
  }

  const handleUpgrade = () => {
    setShowUpgradeDialog(false);
    toast.info("Premium upgrade coming soon! Get unlimited resumes + AI features for ₹199/month");
    // You can add navigation to pricing page here when ready
    // navigate('/pricing');
  };

  return (
    <>
      <div className="mt-2 space-y-2">
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
            {loading ? "Generating..." : isPremium ? label : label}
          </Button>
          <span className="text-xs text-muted-foreground">
            {isPremium ? "Powered by Gemini AI" : "Premium Feature - ₹199/month"}
          </span>
        </div>
        {suggestion && (
          <div className="bg-primary/5 border border-primary/20 rounded-md p-2 text-sm">
            <span className="font-semibold text-primary">AI Suggestion:</span>
            <br />
            {suggestion}
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" type="button" onClick={handleAccept}>
                Insert Suggestion
              </Button>
              <Button size="sm" variant="ghost" type="button" onClick={() => setSuggestion(null)}>
                Dismiss
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
                <h4 className="font-semibold text-yellow-800 mb-2">Premium Benefits:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>✨ Unlimited AI-powered content suggestions</li>
                  <li>📄 Unlimited resume saves</li>
                  <li>☁️ Cloud backup & sync</li>
                  <li>📚 Version history</li>
                  <li>🎨 Advanced customization options</li>
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
