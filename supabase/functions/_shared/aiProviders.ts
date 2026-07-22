import { AIKeyManager } from './aiKeyManager.ts';

export type AIProvider = 'gemini' | 'deepseek' | 'openai';

export interface TextModelResult {
  text: string | null;
  error?: string;
}

export async function callTextModel(
  provider: AIProvider,
  apiKey: string,
  prompt: string,
  opts?: { maxTokens?: number; temperature?: number; timeoutMs?: number }
): Promise<TextModelResult> {
  const temperature = opts?.temperature ?? 0.7;
  const maxTokens = opts?.maxTokens ?? 2048;
  const timeoutMs = opts?.timeoutMs ?? 20000;

  try {
    if (provider === 'gemini') {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          signal: AbortSignal.timeout(timeoutMs),
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature,
              maxOutputTokens: maxTokens,
            },
          }),
        }
      );
      if (!response.ok) {
        const errText = await response.text().catch(() => response.statusText);
        return { text: null, error: `Gemini API error ${response.status}: ${errText}` };
      }
      const json = await response.json();
      const text: string | null = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
      return { text };
    }

    if (provider === 'deepseek') {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(timeoutMs),
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: maxTokens,
        }),
      });
      if (!response.ok) {
        const errText = await response.text().catch(() => response.statusText);
        return { text: null, error: `DeepSeek API error ${response.status}: ${errText}` };
      }
      const json = await response.json();
      const text: string | null = json?.choices?.[0]?.message?.content ?? null;
      return { text };
    }

    if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(timeoutMs),
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: maxTokens,
        }),
      });
      if (!response.ok) {
        const errText = await response.text().catch(() => response.statusText);
        return { text: null, error: `OpenAI API error ${response.status}: ${errText}` };
      }
      const json = await response.json();
      const text: string | null = json?.choices?.[0]?.message?.content ?? null;
      return { text };
    }

    return { text: null, error: `Unknown provider: ${provider}` };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { text: null, error: message };
  }
}

export async function getAnyActiveKey(
  keyManager: AIKeyManager
): Promise<{ provider: AIProvider; key: string } | null> {
  // The admin's explicit "Set Primary"/"Set Fallback" choice in AI Management
  // is a single global setting (not per-provider - see getGlobalPrimaryKey),
  // so it IS the intended default LLM for every text-generation feature and
  // must win regardless of which provider it happens to be. Only fall back to
  // the fixed provider order below if the admin hasn't designated one.
  const globalPrimary = await keyManager.getGlobalPrimaryKey();
  if (globalPrimary) {
    return { provider: globalPrimary.provider as AIProvider, key: globalPrimary.key };
  }

  const globalFallback = await keyManager.getGlobalFallbackKey();
  if (globalFallback) {
    return { provider: globalFallback.provider as AIProvider, key: globalFallback.key };
  }

  const providers: AIProvider[] = ['gemini', 'deepseek', 'openai'];
  for (const provider of providers) {
    const key = await keyManager.getActiveKey(provider);
    if (key) {
      return { provider, key };
    }
  }
  return null;
}
