/**
 * Universal AI Generation Engine with direct client-side provider fallback.
 * 
 * Guarantees that AI features (Blog Post Generator, Resume Suggestions,
 * Cover Letter Writer, Job Match Analyzer, Translation, SEO Auditing)
 * will NEVER fail due to edge function timeouts, cold-starts, or missing edge deployments.
 */

import { supabase } from '@/integrations/supabase/client';

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

interface StoredKey {
  provider: SupportedAIProvider;
  key: string;
  is_primary: boolean;
  is_fallback: boolean;
}

/**
 * Retrieves configured and active API keys from the database.
 */
export async function getActiveAIKeys(): Promise<StoredKey[]> {
  try {
    const { data, error } = await supabase
      .from('ai_api_keys')
      .select('provider, key, is_primary, is_fallback, is_active')
      .eq('is_active', true)
      .order('is_primary', { ascending: false });

    if (error || !data) {
      return [];
    }

    return (data as any[]).filter(
      (k) => k.key && ['deepseek', 'openai', 'gemini'].includes(k.provider)
    ) as StoredKey[];
  } catch (err) {
    console.warn('[UniversalAI] Failed to query active keys from DB:', err);
    return [];
  }
}

/**
 * Direct call to DeepSeek API (deepseek-chat / DeepSeek-V3)
 */
async function callDeepSeekDirect(
  apiKey: string,
  prompt: string,
  systemPrompt?: string,
  opts?: { maxTokens?: number; temperature?: number; timeoutMs?: number }
): Promise<string> {
  const timeoutMs = opts?.timeoutMs ?? 90000;
  const messages: { role: 'system' | 'user'; content: string }[] = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    signal: AbortSignal.timeout(timeoutMs),
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      max_tokens: opts?.maxTokens ?? 4000,
      temperature: opts?.temperature ?? 0.7,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    let parsedMsg = errText;
    try {
      const parsed = JSON.parse(errText);
      parsedMsg = parsed.error?.message || parsed.message || errText;
    } catch {
      // raw text
    }
    throw new Error(`DeepSeek API error (${res.status}): ${parsedMsg}`);
  }

  const json = await res.json();
  const text = json?.choices?.[0]?.message?.content;
  if (!text) throw new Error('DeepSeek returned empty content');
  return text;
}

/**
 * Direct call to OpenAI API (gpt-4o-mini)
 */
async function callOpenAIDirect(
  apiKey: string,
  prompt: string,
  systemPrompt?: string,
  opts?: { maxTokens?: number; temperature?: number; timeoutMs?: number }
): Promise<string> {
  const timeoutMs = opts?.timeoutMs ?? 90000;
  const messages: { role: 'system' | 'user'; content: string }[] = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    signal: AbortSignal.timeout(timeoutMs),
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: opts?.maxTokens ?? 4000,
      temperature: opts?.temperature ?? 0.7,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    let parsedMsg = errText;
    try {
      const parsed = JSON.parse(errText);
      parsedMsg = parsed.error?.message || parsed.message || errText;
    } catch {
      // raw text
    }
    throw new Error(`OpenAI API error (${res.status}): ${parsedMsg}`);
  }

  const json = await res.json();
  const text = json?.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenAI returned empty content');
  return text;
}

/**
 * Direct call to Google Gemini API
 */
async function callGeminiDirect(
  apiKey: string,
  prompt: string,
  systemPrompt?: string,
  opts?: { maxTokens?: number; temperature?: number; timeoutMs?: number }
): Promise<string> {
  const timeoutMs = opts?.timeoutMs ?? 90000;
  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash'];
  let lastError = 'Gemini generation failed';

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey.trim(),
          },
          signal: AbortSignal.timeout(timeoutMs),
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
            generationConfig: {
              maxOutputTokens: opts?.maxTokens ?? 4000,
              temperature: opts?.temperature ?? 0.7,
            },
          }),
        }
      );

      if (res.ok) {
        const json = await res.json();
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }

      const errText = await res.text().catch(() => res.statusText);
      lastError = `Gemini ${model} error (${res.status}): ${errText}`;
      if (res.status !== 404 && res.status !== 400) break;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  throw new Error(lastError);
}

/**
 * Universal Generate Function:
 * Resolves active keys, attempts direct generation, automatically falls back
 * between primary/secondary keys, and provides detailed error reporting.
 */
export async function generateAIContent(options: AIGenerationOptions): Promise<AIGenerationResult> {
  const keys = await getActiveAIKeys();

  if (keys.length === 0) {
    throw new Error('No active AI API key found. Please configure a DeepSeek, Gemini, or OpenAI key in Admin > AI Providers.');
  }

  // Sort keys: Primary first, then Fallback, then others
  const sortedKeys = [...keys].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    if (a.is_fallback && !b.is_fallback) return -1;
    if (!a.is_fallback && b.is_fallback) return 1;
    return 0;
  });

  const errors: string[] = [];

  for (const entry of sortedKeys) {
    try {
      let text = '';
      let modelUsed = '';

      if (entry.provider === 'deepseek') {
        text = await callDeepSeekDirect(entry.key, options.prompt, options.systemPrompt, {
          maxTokens: options.maxTokens,
          temperature: options.temperature,
          timeoutMs: options.timeoutMs,
        });
        modelUsed = 'deepseek-chat';
      } else if (entry.provider === 'openai') {
        text = await callOpenAIDirect(entry.key, options.prompt, options.systemPrompt, {
          maxTokens: options.maxTokens,
          temperature: options.temperature,
          timeoutMs: options.timeoutMs,
        });
        modelUsed = 'gpt-4o-mini';
      } else if (entry.provider === 'gemini') {
        text = await callGeminiDirect(entry.key, options.prompt, options.systemPrompt, {
          maxTokens: options.maxTokens,
          temperature: options.temperature,
          timeoutMs: options.timeoutMs,
        });
        modelUsed = 'gemini-2.5-flash';
      }

      if (text && text.trim()) {
        return {
          text: text.trim(),
          provider: entry.provider,
          modelUsed,
        };
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[UniversalAI] ${entry.provider} generation failed:`, msg);
      errors.push(`${entry.provider}: ${msg}`);
    }
  }

  throw new Error(`AI generation failed across all configured providers:\n${errors.join('\n')}`);
}
