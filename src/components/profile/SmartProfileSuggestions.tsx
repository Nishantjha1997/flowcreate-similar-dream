import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Lightbulb, 
  TrendingUp, 
  Users, 
  Target,
  Sparkles,
  CheckCircle2,
  Clock,
  Crown
} from 'lucide-react';
import { UserProfile } from '@/hooks/useUserProfile';

interface SmartSuggestion {
  id: string;
  type: 'skill' | 'experience' | 'education' | 'certification' | 'summary';
  title: string;
  description: string;
  suggestion: string;
  relevance: 'high' | 'medium' | 'low';
  source: 'ai' | 'trending' | 'industry' | 'similar_profiles';
  action?: () => void;
}

interface SmartProfileSuggestionsProps {
  profile: UserProfile | null;
  onApplySuggestion: (type: string, data: any) => void;
  isPremium?: boolean;
}

export const SmartProfileSuggestions: React.FC<SmartProfileSuggestionsProps> = ({
  profile,
  onApplySuggestion,
  isPremium = false
}) => {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (profile) {
      generateSmartSuggestions();
    }
  }, [profile]);

  const generateSmartSuggestions = () => {
    if (!profile) return;

    const newSuggestions: SmartSuggestion[] = [];

    // Industry-specific skill suggestions
    const currentSkills = profile.technical_skills || [];
    const industry = profile.industry?.toLowerCase() || '';
    
    if (industry.includes('tech') || industry.includes('software') || industry.includes('it')) {
      const techSuggestions = [
        'Docker', 'Kubernetes', 'AWS', 'React', 'Node.js', 'Python', 
        'TypeScript', 'GraphQL', 'MongoDB', 'PostgreSQL', 'Git', 'CI/CD'
      ];
      
      const missingSills = techSuggestions.filter(skill => 
        !currentSkills.some(existing => 
          existing.toLowerCase().includes(skill.toLowerCase())
        )
      );

      missingSills.slice(0, 3).forEach((skill, index) => {
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

    // Experience level suggestions
    const workExp = profile.work_experience || [];
    const experienceLevel = profile.experience_level;
    
    if (workExp.length < 2 && experienceLevel !== 'entry') {
      newSuggestions.push({
        id: 'experience-add',
        type: 'experience',
        title: 'Add more work experience',
        description: 'Your experience level suggests you should have more roles listed',
        suggestion: 'Consider adding internships, freelance work, or previous positions',
        relevance: 'high',
        source: 'ai'
      });
    }

    // Professional summary enhancement
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

    // Certification suggestions based on role
    const currentPosition = profile.current_position?.toLowerCase() || '';
    const certifications = profile.certifications || [];
    
    if (currentPosition.includes('project') || currentPosition.includes('manager')) {
      if (!certifications.some(cert => cert.name?.toLowerCase().includes('pmp') || cert.name?.toLowerCase().includes('scrum'))) {
        newSuggestions.push({
          id: 'cert-pm',
          type: 'certification',
          title: 'Consider PMP or Scrum certification',
          description: 'Project management certifications are valuable for leadership roles',
          suggestion: 'PMP, Scrum Master, or Agile certifications',
          relevance: 'medium',
          source: 'industry'
        });
      }
    }

    // Education enhancement
    const education = profile.education || [];
    if (education.length === 0) {
      newSuggestions.push({
        id: 'education-add',
        type: 'education',
        title: 'Add your educational background',
        description: 'Education information helps recruiters understand your foundation',
        suggestion: 'Add your degree, institution, and graduation year',
        relevance: 'medium',
        source: 'ai'
      });
    }

    // Trending skills suggestions
    const trendingSkills = [
      'Artificial Intelligence', 'Machine Learning', 'Data Science', 
      'Cloud Computing', 'Cybersecurity', 'DevOps', 'Blockchain'
    ];

    trendingSkills.slice(0, 2).forEach((skill) => {
      if (!currentSkills.some(existing => 
        existing.toLowerCase().includes(skill.toLowerCase())
      )) {
        newSuggestions.push({
          id: `trending-${skill}`,
          type: 'skill',
          title: `Consider learning ${skill}`,
          description: `${skill} is a trending skill with high market demand`,
          suggestion: skill,
          relevance: 'low',
          source: 'trending'
        });
      }
    });

    setSuggestions(newSuggestions.slice(0, isPremium ? 8 : 3));
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
      // Add more cases as needed
    }
  };

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'ai': return 'AI Powered';
      case 'trending': return 'Trending';
      case 'industry': return 'Industry';
      case 'similar_profiles': return 'Similar Profiles';
      default: return 'Smart';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Smart Suggestions
          {!isPremium && <Crown className="w-4 h-4 text-yellow-600" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isPremium && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <Crown className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Upgrade to Premium to unlock unlimited smart suggestions and AI-powered recommendations.
            </AlertDescription>
          </Alert>
        )}

        {suggestions.length === 0 ? (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Your profile is well-optimized! Check back later for new suggestions.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <Card 
                key={suggestion.id} 
                className={`transition-all ${
                  appliedSuggestions.has(suggestion.id) 
                    ? 'opacity-50 bg-gray-50' 
                    : 'hover:shadow-md'
                } ${!isPremium && index >= 2 ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getRelevanceColor(suggestion.relevance)}`}
                        >
                          {suggestion.relevance.toUpperCase()}
                        </Badge>
                        <Badge variant="secondary" className="text-xs flex items-center gap-1">
                          {getSourceIcon(suggestion.source)}
                          {getSourceLabel(suggestion.source)}
                        </Badge>
                      </div>
                      
                      <h4 className="font-medium text-sm mb-1">{suggestion.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {suggestion.description}
                      </p>
                      
                      <div className="bg-primary/5 rounded p-2 mb-3">
                        <p className="text-xs font-medium text-primary">
                          Suggestion: {suggestion.suggestion}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      {appliedSuggestions.has(suggestion.id) ? (
                        <Badge variant="secondary" className="text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Applied
                        </Badge>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => applySuggestion(suggestion)}
                          disabled={!isPremium && index >= 2}
                          className="text-xs"
                        >
                          {!isPremium && index >= 2 ? 'Premium' : 'Apply'}
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-xs text-muted-foreground"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        Later
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isPremium && suggestions.length > 2 && (
          <div className="text-center pt-3 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              {suggestions.length - 2} more suggestions available
            </p>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-600" />
              Upgrade for All Suggestions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};