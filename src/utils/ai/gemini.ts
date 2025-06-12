
import { supabase } from "@/integrations/supabase/client";

/**
 * Enhanced utility to request resume enhancements from Gemini API via Supabase Edge Function.
 * Provides contextual, varied suggestions based on resume section type.
 */

export type SuggestionType = 'bullet' | 'paragraph' | 'concise';
export type ResumeSection = 'summary' | 'experience' | 'education' | 'skills' | 'projects';

interface SuggestionRequest {
  content: string;
  section: ResumeSection;
  suggestionType: SuggestionType;
  jobTitle?: string;
  company?: string;
  additionalContext?: string;
}

export async function fetchGeminiSuggestions(request: SuggestionRequest): Promise<string[]> {
  const prompts = generateContextualPrompts(request);
  const suggestions: string[] = [];

  // Get the access token for authentication
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  // Fetch multiple suggestions in parallel
  const suggestionPromises = prompts.map(async (prompt) => {
    try {
      const response = await fetch(
        "https://tkhnxiqvghvejdulvmmx.functions.supabase.co/gemini-suggest",
        {
          method: "POST",
          headers,
          body: JSON.stringify({ prompt }),
        }
      );

      const data = await response.json();
      console.log("[Gemini] Suggestion response", data);

      if (data.suggestion) {
        return data.suggestion.trim();
      } else if (data.code === 401 || data.message?.toLowerCase().includes('authorization')) {
        throw new Error(
          "Authorization error: Please make sure you are logged in, or contact support if this issue persists."
        );
      } else {
        throw new Error(data.error || "No suggestion returned from Gemini");
      }
    } catch (error) {
      console.error("[Gemini] Individual suggestion error:", error);
      return null;
    }
  });

  const results = await Promise.allSettled(suggestionPromises);
  
  results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value) {
      suggestions.push(result.value);
    }
  });

  if (suggestions.length === 0) {
    throw new Error("Failed to generate any suggestions. Please try again.");
  }

  return suggestions;
}

function generateContextualPrompts(request: SuggestionRequest): string[] {
  const { content, section, suggestionType, jobTitle, company, additionalContext } = request;
  
  const contextInfo = [
    jobTitle && `Job Title: ${jobTitle}`,
    company && `Company: ${company}`,
    additionalContext && `Additional Context: ${additionalContext}`
  ].filter(Boolean).join('\n');

  const baseContext = contextInfo ? `\nContext:\n${contextInfo}\n` : '';

  switch (section) {
    case 'summary':
      return generateSummaryPrompts(content, suggestionType, baseContext);
    case 'experience':
      return generateExperiencePrompts(content, suggestionType, baseContext);
    case 'education':
      return generateEducationPrompts(content, suggestionType, baseContext);
    case 'skills':
      return generateSkillsPrompts(content, suggestionType, baseContext);
    case 'projects':
      return generateProjectPrompts(content, suggestionType, baseContext);
    default:
      return [createGenericPrompt(content, suggestionType, baseContext)];
  }
}

function generateSummaryPrompts(content: string, type: SuggestionType, context: string): string[] {
  const prompts = [];
  
  if (type === 'bullet') {
    prompts.push(`${context}Transform this professional summary into 3-4 compelling bullet points that highlight key achievements and skills. Make each bullet start with a strong action verb and include quantifiable results where possible:\n\n"${content}"`);
  } else if (type === 'paragraph') {
    prompts.push(`${context}Rewrite this professional summary as a compelling 3-4 sentence paragraph that tells a cohesive story about the candidate's career progression and value proposition:\n\n"${content}"`);
  } else {
    prompts.push(`${context}Create a concise, impactful 2-sentence professional summary that captures the candidate's core expertise and unique value:\n\n"${content}"`);
  }

  // Add alternative approaches
  prompts.push(`${context}Enhance this professional summary to be more achievement-focused and results-driven. Use strong action verbs and quantifiable metrics:\n\n"${content}"`);
  prompts.push(`${context}Rewrite this professional summary to better showcase leadership qualities and strategic thinking:\n\n"${content}"`);

  return prompts;
}

function generateExperiencePrompts(content: string, type: SuggestionType, context: string): string[] {
  const prompts = [];
  
  if (type === 'bullet') {
    prompts.push(`${context}Transform this job description into 3-5 powerful bullet points using the STAR method (Situation, Task, Action, Result). Start each bullet with a strong action verb and include quantifiable achievements:\n\n"${content}"`);
    prompts.push(`${context}Create achievement-focused bullet points that demonstrate impact and results. Use metrics, percentages, and numbers wherever possible:\n\n"${content}"`);
  } else if (type === 'paragraph') {
    prompts.push(`${context}Rewrite this experience as a compelling paragraph that tells the story of your contributions and achievements in this role:\n\n"${content}"`);
  } else {
    prompts.push(`${context}Create a concise, high-impact description of this role focusing on the most impressive achievements:\n\n"${content}"`);
  }

  prompts.push(`${context}Enhance this job description to better showcase leadership, problem-solving, and innovation skills:\n\n"${content}"`);

  return prompts;
}

function generateEducationPrompts(content: string, type: SuggestionType, context: string): string[] {
  const prompts = [];
  
  if (type === 'bullet') {
    prompts.push(`${context}Transform this education description into 2-3 bullet points highlighting academic achievements, relevant coursework, honors, or projects:\n\n"${content}"`);
  } else if (type === 'paragraph') {
    prompts.push(`${context}Rewrite this education description as a cohesive paragraph that emphasizes relevant academic achievements and skills gained:\n\n"${content}"`);
  } else {
    prompts.push(`${context}Create a concise education description that highlights the most relevant and impressive aspects:\n\n"${content}"`);
  }

  prompts.push(`${context}Enhance this education description to better showcase academic achievements, leadership roles, and relevant projects:\n\n"${content}"`);
  prompts.push(`${context}Rewrite this education section to emphasize skills and knowledge that are directly relevant to the target career:\n\n"${content}"`);

  return prompts;
}

function generateSkillsPrompts(content: string, type: SuggestionType, context: string): string[] {
  const prompts = [];
  
  prompts.push(`${context}Organize and enhance this skills list by grouping related skills into categories (Technical, Leadership, Soft Skills, etc.) and using industry-standard terminology:\n\n"${content}"`);
  prompts.push(`${context}Refine this skills list to include more specific, in-demand skills relevant to the target role. Remove generic skills and add technical proficiencies:\n\n"${content}"`);
  prompts.push(`${context}Transform this skills list into a more strategic presentation that showcases both hard and soft skills with brief proficiency indicators:\n\n"${content}"`);

  return prompts;
}

function generateProjectPrompts(content: string, type: SuggestionType, context: string): string[] {
  const prompts = [];
  
  if (type === 'bullet') {
    prompts.push(`${context}Transform this project description into 3-4 bullet points that clearly outline the challenge, your approach, technologies used, and measurable outcomes:\n\n"${content}"`);
  } else if (type === 'paragraph') {
    prompts.push(`${context}Rewrite this project description as a compelling paragraph that tells the story of the project from conception to completion and impact:\n\n"${content}"`);
  } else {
    prompts.push(`${context}Create a concise project description that captures the essence, your role, and the key achievements:\n\n"${content}"`);
  }

  prompts.push(`${context}Enhance this project description to better showcase technical skills, problem-solving abilities, and measurable results:\n\n"${content}"`);
  prompts.push(`${context}Rewrite this project description to emphasize innovation, collaboration, and the business impact of your work:\n\n"${content}"`);

  return prompts;
}

function createGenericPrompt(content: string, type: SuggestionType, context: string): string {
  return `${context}Enhance the following resume content to be more professional, impactful, and results-driven. Use strong action verbs and include specific achievements where possible:\n\n"${content}"`;
}

// Legacy function for backward compatibility
export async function fetchGeminiSuggestion(description: string): Promise<string> {
  const suggestions = await fetchGeminiSuggestions({
    content: description,
    section: 'experience', // Default to experience for backward compatibility
    suggestionType: 'bullet'
  });
  return suggestions[0] || description;
}
