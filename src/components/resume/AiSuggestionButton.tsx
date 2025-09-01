import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Lightbulb, Crown, RefreshCw, Eye, EyeOff } from "lucide-react";
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
import { cn } from "@/lib/utils";

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

// Demo suggestions for free users
const demoSuggestions = {
  experience: [
    "• Led a cross-functional team of 8 developers to deliver a customer portal that increased user engagement by 35% and reduced support tickets by 22%",
    "• Implemented automated testing framework using Jest and Selenium, reducing manual testing time by 60% and improving code quality metrics",
    "• Optimized database queries and introduced Redis caching, resulting in 40% faster page load times and improved user experience for 10,000+ daily users"
  ],
  skills: [
    "JavaScript (ES6+), React.js, Node.js, TypeScript, Python, AWS, Docker, MongoDB, PostgreSQL, Git",
    "Frontend: React, Vue.js, Angular • Backend: Express.js, FastAPI • Cloud: AWS, Azure • Databases: PostgreSQL, MongoDB",
    "Programming Languages: JavaScript, Python, Java • Frameworks: React, Express.js, Django • Tools: Docker, Kubernetes, Jenkins"
  ],
  education: [
    "Bachelor of Science in Computer Science with Magna Cum Laude honors, GPA: 3.8/4.0. Relevant coursework: Data Structures, Algorithms, Database Systems, Software Engineering, Machine Learning.",
    "Computer Science degree with focus on full-stack development and machine learning. Dean's List for 6 semesters. Active in coding club and hackathons."
  ]
};

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
  const [showDemoPreview, setShowDemoPreview] = useState(false);

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

  const getDemoSuggestions = (section: ResumeSection): string[] => {
    const sectionKey = section as keyof typeof demoSuggestions;
    return demoSuggestions[sectionKey] || demoSuggestions.experience;
  };

  async function handleGenerate() {
    if (!isPremium) {
      setShowDemoPreview(true);
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
    setShowDemoPreview(false);
    toast.info("Premium upgrade coming soon! Get unlimited resumes + AI features for ₹199/month");
    if (onUpsell) onUpsell();
  };

  const availableTypes = getSectionSpecificTypes(section);
  const demos = getDemoSuggestions(section);

  return (
    <>
      <div className="mt-2 space-y-3" data-tour="ai-button">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={isPremium ? "secondary" : "outline"}
            onClick={handleGenerate}
            disabled={loading}
            className={cn(
              "flex items-center gap-1",
              !isPremium && "border-yellow-300 text-yellow-700 hover:bg-yellow-50"
            )}
            aria-label={isPremium ? "Generate AI suggestions" : "Preview AI suggestions (Premium feature)"}
          >
            {loading ? (
              <Loader2 className="animate-spin h-4 w-4" aria-hidden="true" />
            ) : isPremium ? (
              <Lightbulb className="h-4 w-4 text-yellow-500" aria-hidden="true" />
            ) : (
              <Crown className="h-4 w-4 text-yellow-600" aria-hidden="true" />
            )}
            {loading ? "Generating..." : label}
          </Button>
          
          {isPremium && availableTypes.length > 1 && (
            <Select 
              value={suggestionType} 
              onValueChange={(value: SuggestionType) => setSuggestionType(value)}
              aria-label="Select suggestion format type"
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg">
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
          <div className="space-y-3" role="region" aria-label="AI generated suggestions">
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
                      aria-label={`Apply suggestion ${index + 1}`}
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
                aria-label="Clear all suggestions"
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
                aria-label="Generate new suggestions"
              >
                <RefreshCw className="h-3 w-3" aria-hidden="true" />
                Generate New
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* AI Demo Preview Dialog */}
      <Dialog open={showDemoPreview} onOpenChange={setShowDemoPreview}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto bg-background border shadow-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" aria-hidden="true" />
              AI Suggestions Preview
            </DialogTitle>
            <DialogDescription>
              See how AI can enhance your {section} section with professional, tailored content.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Sample AI Suggestions for {section}:</h4>
              <div className="space-y-3">
                {demos.slice(0, 2).map((demo, index) => (
                  <div key={index} className="bg-white/80 border border-blue-200 rounded-md p-3 text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-blue-700">
                        ✨ AI Suggestion {index + 1}
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        disabled
                        className="text-xs opacity-75"
                        aria-label="Premium feature - upgrade to use"
                      >
                        Use This (Premium)
                      </Button>
                    </div>
                    <div className="text-sm text-gray-700">
                      {demo}
                    </div>
                  </div>
                ))}
                
                {/* Blurred additional suggestions */}
                <div className="relative">
                  <div className="bg-white/80 border border-blue-200 rounded-md p-3 text-sm blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-blue-700">
                        ✨ AI Suggestion 3
                      </span>
                      <Button size="sm" variant="outline" disabled className="text-xs">
                        Use This
                      </Button>
                    </div>
                    <div className="text-sm text-gray-700">
                      {demos[2] || "Additional AI-generated content with industry-specific keywords and quantified achievements..."}
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-yellow-300">
                      <div className="flex items-center gap-2 text-yellow-700">
                        <Crown className="h-4 w-4" aria-hidden="true" />
                        <span className="font-medium text-sm">Premium Feature</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">🚀 Unlock Full AI Power:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>✨ Generate 5+ unique suggestions per section</li>
                <li>🎯 Context-aware content tailored to your industry</li>
                <li>📊 Achievement-focused, quantifiable results</li>
                <li>🔄 Multiple formats: bullets, paragraphs, concise</li>
                <li>📄 Unlimited resume saves & exports</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-primary">₹199/month</div>
              <div className="text-sm text-muted-foreground">30-day money-back guarantee</div>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowDemoPreview(false)}
              aria-label="Close preview and continue with free version"
            >
              Continue Free
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
              onClick={handleUpgrade}
              aria-label="Upgrade to premium to unlock AI features"
            >
              <Crown className="mr-2 h-4 w-4" aria-hidden="true" />
              Upgrade Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Premium Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md bg-background border shadow-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" aria-hidden="true" />
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
              aria-label="Close upgrade dialog"
            >
              Maybe Later
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
              onClick={handleUpgrade}
              aria-label="Start premium subscription"
            >
              Upgrade Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};