import { supabase } from '@/integrations/supabase/client';
import { getEdgeFunctionErrorMessage } from '@/utils/edgeFunctionError';

/**
 * Server-backed AI generation shared by resume, cover-letter, translation,
 * job-match, and admin tools. Provider keys are resolved by the
 * `gemini-suggest` Edge Function and never enter browser JavaScript or a
 * client-side provider request.
 */
export type SupportedAIProvider = 'deepseek' | 'openai' | 'gemini';

export interface AIGenerationOptions {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
  preferredProvider?: SupportedAIProvider;
}

export interface AIGenerationResult {
  text: string;
  provider: SupportedAIProvider;
  modelUsed: string;
}

const SUPPORTED_PROVIDERS = new Set<SupportedAIProvider>(['deepseek', 'openai', 'gemini']);

function promptWithSystemInstructions(options: AIGenerationOptions): string {
  const prompt = options.prompt.trim();
  const systemPrompt = options.systemPrompt?.trim();
  return systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
}

/**
 * Generate through the authenticated server function. The server applies
 * plan limits, resolves the admin-selected provider, rotates fallbacks, and
 * records usage only after a successful provider response.
 */
export async function generateAIContent(options: AIGenerationOptions): Promise<AIGenerationResult> {
  const prompt = promptWithSystemInstructions(options);
  if (!prompt) throw new Error('AI prompt is required');

  const { data, error } = await supabase.functions.invoke('gemini-suggest', {
    body: {
      prompt,
      maxTokens: options.maxTokens,
      temperature: options.temperature,
      preferredProvider: options.preferredProvider,
    },
  });

  if (error) {
    throw new Error(await getEdgeFunctionErrorMessage(error, 'AI generation failed'));
  }
  if (data?.error) throw new Error(String(data.error));

  const text = typeof data?.suggestion === 'string' ? data.suggestion.trim() : '';
  if (!text) throw new Error('AI service returned no content');

  const provider = SUPPORTED_PROVIDERS.has(data?.provider) ? data.provider : (options.preferredProvider ?? 'gemini');
  return {
    text,
    provider,
    modelUsed: typeof data?.modelUsed === 'string' ? data.modelUsed : 'server-selected',
  };
}
