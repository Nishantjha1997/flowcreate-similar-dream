
import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Lightbulb, Crown } from "lucide-react";
import { toast } from "sonner";
import { fetchGeminiSuggestion } from "@/utils/ai/gemini";

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

  async function handleGenerate() {
    if (!isPremium) {
      if (onUpsell) {
        onUpsell();
      } else {
        toast.info("AI features are available with Premium! Upgrade for just ₹199/month.");
      }
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

  return (
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
          {loading ? "Generating..." : isPremium ? label : "AI Upgrade"}
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
  );
};
