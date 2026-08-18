/**
 * Direct client-side verification helper for AI providers.
 * Used as an automatic fallback when Supabase Edge Functions are unreachable
 * or when testing draft keys directly from the browser Admin dashboard.
 */

export interface DirectTestResult {
  ok: boolean;
  message?: string;
  error?: string;
}

export async function testProviderDirectly(
  provider: string,
  apiKey: string
): Promise<DirectTestResult> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    return { ok: false, error: 'API key is required' };
  }

  const prompt = 'Reply with exactly: MakeCV connection OK';
  const timeoutMs = 15000;

  try {
    if (provider === 'deepseek') {
      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanKey}`,
        },
        signal: AbortSignal.timeout(timeoutMs),
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 16,
          temperature: 0,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => res.statusText);
        let parsedMessage = errorText;
        try {
          const parsed = JSON.parse(errorText);
          parsedMessage = parsed.error?.message || parsed.message || errorText;
        } catch {
          // use raw text
        }
        return { ok: false, error: `DeepSeek error (${res.status}): ${parsedMessage}` };
      }

      const json = await res.json();
      const reply = json?.choices?.[0]?.message?.content?.trim() || 'MakeCV connection OK';
      return { ok: true, message: reply };
    }

    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanKey}`,
        },
        signal: AbortSignal.timeout(timeoutMs),
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 16,
          temperature: 0,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => res.statusText);
        let parsedMessage = errorText;
        try {
          const parsed = JSON.parse(errorText);
          parsedMessage = parsed.error?.message || parsed.message || errorText;
        } catch {
          // use raw text
        }
        return { ok: false, error: `OpenAI error (${res.status}): ${parsedMessage}` };
      }

      const json = await res.json();
      const reply = json?.choices?.[0]?.message?.content?.trim() || 'MakeCV connection OK';
      return { ok: true, message: reply };
    }

    if (provider === 'gemini') {
      const models = ['gemini-2.5-flash', 'gemini-2.0-flash'];
      let lastError = 'Gemini verification failed';

      for (const model of models) {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': cleanKey,
            },
            signal: AbortSignal.timeout(timeoutMs),
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                maxOutputTokens: 16,
                temperature: 0,
              },
            }),
          }
        );

        if (res.ok) {
          const json = await res.json();
          const reply = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'MakeCV connection OK';
          return { ok: true, message: reply };
        }

        const errText = await res.text().catch(() => res.statusText);
        lastError = `Gemini ${model} error (${res.status}): ${errText}`;
        if (res.status !== 404 && res.status !== 400) break;
      }

      return { ok: false, error: lastError };
    }

    return { ok: false, error: `Unsupported provider: ${provider}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Direct test error: ${msg}` };
  }
}
