import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Lightbulb, 
  TrendingUp, 
  Users, 
  Target,
  Sparkles,
  CheckCircle2,
  X,
  Crown,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { UserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';

interface SmartSuggestion {
  id: string;
  type: 'skill' | 'experience' | 'education' | 'certification' | 'summary';
  title: string;
  description: string;
  suggestion: string;
  relevance: 'high' | 'medium' | 'low';
  source: 'ai' | 'trending' | 'industry' | 'similar_profiles';
}

interface FloatingSmartSuggestionsProps {
  profile: UserProfile | null;
  onApplySuggestion: (type: string, data: any) => void;
  isPremium?: boolean;
}

export const FloatingSmartSuggestions: React.FC<FloatingSmartSuggestionsProps> = ({
  profile,
  onApplySuggestion,
  isPremium = false
}) => {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (profile) {
      generateSmartSuggestions();
    }
  }, [profile]);

  useEffect(() => {
    if (suggestions.length > 0 && !isVisible) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [suggestions]);

  const generateSmartSuggestions = () => {
    if (!profile) return;

    const newSuggestions: SmartSuggestion[] = [];
    const currentSkills = profile.technical_skills || [];
    const industry = profile.industry?.toLowerCase() || '';
    
    if (industry.includes('tech') || industry.includes('software') || industry.includes('it')) {
      const techSuggestions = ['Docker', 'Kubernetes', 'AWS', 'React', 'TypeScript'];
      const missingSills = techSuggestions.filter(skill => 
        !currentSkills.some(existing => 
          existing.toLowerCase().includes(skill.toLowerCase())
        )
      );

      missingSills.slice(0, 2).forEach((skill, index) => {
        newSuggestions.push({
          id: `skill-${skill}`,
          type: 'skill',
          title: `Add ${skill} to your skills`,
          description: `${skill} is highly sought after in the ${industry} industry`,
          suggestion: skill,
          relevance: index === 0 ? 'high' : 'medium',
          source: 'industry'
        });
      });
    }

    const summary = profile.professional_summary || '';
    if (summary.length < 100) {
      newSuggestions.push({
        id: 'summary-enhance',
        type: 'summary',
        title: 'Enhance your professional summary',
        description: 'A compelling summary increases profile views by 40%',
        suggestion: 'Write a 2-3 sentence summary highlighting your key achievements and career goals',
        relevance: 'high',
        source: 'ai'
      });
    }

    setSuggestions(newSuggestions.slice(0, isPremium ? 5 : 3));
  };

  const applySuggestion = (suggestion: SmartSuggestion) => {
    setAppliedSuggestions(prev => new Set([...prev, suggestion.id]));
    
    switch (suggestion.type) {
      case 'skill':
        onApplySuggestion('technical_skills', [
          ...(profile?.technical_skills || []),
          suggestion.suggestion
        ]);
        break;
      case 'summary':
        onApplySuggestion('professional_summary', suggestion.suggestion);
        break;
    }

    toast({
      title: "Suggestion Applied",
      description: "Your profile has been updated with the suggestion"
    });

    // Move to next suggestion or hide if last one
    if (currentSuggestionIndex < suggestions.length - 1) {
      setCurrentSuggestionIndex(prev => prev + 1);
    } else {
      setIsVisible(false);
    }
  };

  const dismissSuggestion = () => {
    if (currentSuggestionIndex < suggestions.length - 1) {
      setCurrentSuggestionIndex(prev => prev + 1);
    } else {
      setIsVisible(false);
    }
  };

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'ai': return <Sparkles className="w-3 h-3" />;
      case 'trending': return <TrendingUp className="w-3 h-3" />;
      case 'industry': return <Target className="w-3 h-3" />;
      case 'similar_profiles': return <Users className="w-3 h-3" />;
      default: return <Lightbulb className="w-3 h-3" />;
    }
  };

  if (!isVisible || suggestions.length === 0 || currentSuggestionIndex >= suggestions.length) {
    return null;
  }

  const currentSuggestion = suggestions[currentSuggestionIndex];
  const isApplied = appliedSuggestions.has(currentSuggestion.id);

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm">
      <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-xl border-2 border-primary/20 animate-in slide-in-from-bottom-4 duration-500">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              <span className="font-semibold text-sm">Smart Suggestion</span>
              <Badge 
                variant="outline" 
                className={`text-xs ${getRelevanceColor(currentSuggestion.relevance)}`}
              >
                {currentSuggestion.relevance.toUpperCase()}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                {getSourceIcon(currentSuggestion.source)}
                AI Powered
              </Badge>
              <span className="text-xs text-muted-foreground">
                {currentSuggestionIndex + 1} of {suggestions.length}
              </span>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-1">{currentSuggestion.title}</h4>
              <p className="text-xs text-muted-foreground mb-2">
                {currentSuggestion.description}
              </p>
            </div>

            {isExpanded && (
              <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                <p className="text-xs font-medium text-primary">
                  💡 {currentSuggestion.suggestion}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs h-7 px-2"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-3 h-3 mr-1" />
                    Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3 mr-1" />
                    Details
                  </>
                )}
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={dismissSuggestion}
                  className="text-xs h-7 px-3"
                >
                  Later
                </Button>
                {isApplied ? (
                  <Button variant="secondary" size="sm" className="text-xs h-7 px-3" disabled>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Applied
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => applySuggestion(currentSuggestion)}
                    disabled={!isPremium && currentSuggestionIndex >= 2}
                    className="text-xs h-7 px-3"
                  >
                    {!isPremium && currentSuggestionIndex >= 2 ? (
                      <>
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </>
                    ) : (
                      'Apply'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};