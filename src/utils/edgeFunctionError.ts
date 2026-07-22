/**
 * supabase-js's FunctionsHttpError.message is always the hardcoded string
 * "Edge Function returned a non-2xx status code" - the real reason (premium
 * gating, quota exceeded, missing key, validation error, etc.) only lives in
 * error.context, the raw Response object, and has to be read from its JSON
 * body. Every edge-function caller in this app was reading .message directly
 * and showing that generic string to users instead of the actual reason.
 */
export async function getEdgeFunctionErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): Promise<string> {
  const context = (error as { context?: unknown } | null)?.context;
  if (context instanceof Response) {
    try {
      const body = await context.clone().json() as { error?: unknown; message?: unknown };
      if (typeof body.error === 'string' && body.error.trim()) return body.error.trim();
      if (typeof body.message === 'string' && body.message.trim()) return body.message.trim();
    } catch {
      try {
        const responseText = await context.clone().text();
        if (responseText.trim()) return responseText.trim();
      } catch {
        // The response body could not be read. Use the safe fallback below.
      }
    }
  }

  if (
    error instanceof Error
    && error.message
    && !error.message.includes('Edge Function returned a non-2xx status code')
  ) {
    return error.message;
  }

  return fallback;
}
