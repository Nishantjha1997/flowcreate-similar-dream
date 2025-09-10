import { useState, useCallback } from 'react';
import { fetchGeminiSuggestions, ResumeSection, SuggestionType } from '@/utils/ai/gemini';
import { toast } from 'sonner';

export interface AIEnhancementRequest {
  content: string;
  section: ResumeSection;
  type?: SuggestionType;
  context?: {
    jobTitle?: string;
    company?: string;
    industry?: string;
    targetRole?: string;
  };
}

export interface AIEnhancementResult {
  suggestions: string[];
  originalContent: string;
  enhancementType: string;
  timestamp: Date;
}

export const useAIEnhancements = (isPremium: boolean = false) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [enhancementHistory, setEnhancementHistory] = useState<AIEnhancementResult[]>([]);

  const generateEnhancements = useCallback(async (
    request: AIEnhancementRequest
  ): Promise<string[]> => {
    if (!isPremium) {
      toast.error('AI enhancements are available for Premium users only');
      return [];
    }

    if (!request.content.trim()) {
      toast.error('Please provide content to enhance');
      return [];
    }

    setIsGenerating(true);
    
    try {
      const suggestions = await fetchGeminiSuggestions({
        content: request.content,
        section: request.section,
        suggestionType: request.type || 'bullet',
        jobTitle: request.context?.jobTitle,
        company: request.context?.company,
        additionalContext: request.context ? 
          `Industry: ${request.context.industry || 'Not specified'}, Target Role: ${request.context.targetRole || 'Not specified'}` 
          : undefined
      });

      // Store in history
      const result: AIEnhancementResult = {
        suggestions,
        originalContent: request.content,
        enhancementType: `${request.section}-${request.type || 'bullet'}`,
        timestamp: new Date()
      };

      setEnhancementHistory(prev => [result, ...prev].slice(0, 10)); // Keep last 10
      
      toast.success(`Generated ${suggestions.length} AI enhancements!`);
      return suggestions;
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate AI enhancements');
      return [];
    } finally {
      setIsGenerating(false);
    }
  }, [isPremium]);

  const enhanceProfileSection = useCallback(async (
    sectionData: any,
    section: ResumeSection,
    targetContext?: string
  ): Promise<string[]> => {
    const content = typeof sectionData === 'string' 
      ? sectionData 
      : JSON.stringify(sectionData);

    return generateEnhancements({
      content,
      section,
      type: 'paragraph',
      context: {
        targetRole: targetContext
      }
    });
  }, [generateEnhancements]);

  const enhanceSkillsList = useCallback(async (
    skills: string[],
    industry?: string
  ): Promise<string[]> => {
    const content = skills.join(', ');
    
    return generateEnhancements({
      content,
      section: 'skills',
      type: 'concise',
      context: {
        industry
      }
    });
  }, [generateEnhancements]);

  const enhanceWorkExperience = useCallback(async (
    experience: any,
    targetRole?: string
  ): Promise<string[]> => {
    const content = `${experience.title} at ${experience.company}: ${experience.description}`;
    
    return generateEnhancements({
      content,
      section: 'experience',
      type: 'bullet',
      context: {
        jobTitle: experience.title,
        company: experience.company,
        targetRole
      }
    });
  }, [generateEnhancements]);

  const enhanceEducation = useCallback(async (
    education: any
  ): Promise<string[]> => {
    const content = `${education.degree} from ${education.institution}: ${education.description || ''}`;
    
    return generateEnhancements({
      content,
      section: 'education',
      type: 'paragraph'
    });
  }, [generateEnhancements]);

  const enhanceProfessionalSummary = useCallback(async (
    summary: string,
    targetRole?: string,
    industry?: string
  ): Promise<string[]> => {
    return generateEnhancements({
      content: summary,
      section: 'summary',
      type: 'paragraph',
      context: {
        targetRole,
        industry
      }
    });
  }, [generateEnhancements]);

  const getUsageStats = useCallback(() => {
    const today = new Date();
    const todayEnhancements = enhancementHistory.filter(
      enhancement => enhancement.timestamp.toDateString() === today.toDateString()
    ).length;

    const thisWeekEnhancements = enhancementHistory.filter(
      enhancement => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return enhancement.timestamp >= weekAgo;
      }
    ).length;

    return {
      todayCount: todayEnhancements,
      weekCount: thisWeekEnhancements,
      totalCount: enhancementHistory.length
    };
  }, [enhancementHistory]);

  const clearHistory = useCallback(() => {
    setEnhancementHistory([]);
    toast.success('Enhancement history cleared');
  }, []);

  return {
    isGenerating,
    enhancementHistory,
    generateEnhancements,
    enhanceProfileSection,
    enhanceSkillsList,
    enhanceWorkExperience,
    enhanceEducation,
    enhanceProfessionalSummary,
    getUsageStats,
    clearHistory
  };
};