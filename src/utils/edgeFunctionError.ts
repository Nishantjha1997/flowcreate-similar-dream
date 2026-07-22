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
      const body = await context.clone().json();
      if (body?.error && typeof body.error === 'string') return body.error;
    } catch {
      // Response wasn't JSON - fall through to the generic handling below.
    }
  }

  if (error instanceof Error && error.message && error.message !== 'Edge Function returned a non-2xx status code') {
    return error.message;
  }

  return fallback;
}
