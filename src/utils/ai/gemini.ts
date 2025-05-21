import { supabase } from "@/integrations/supabase/client";

/**
 * Utility to request resume enhancements from Gemini API via Supabase Edge Function.
 * Secret should be set in Supabase project as GEMINI_API_KEY.
 */
export async function fetchGeminiSuggestion(description: string): Promise<string> {
  const prompt = `Enhance the following job description to sound more professional, impactful, and results-driven for a resume. Keep it concise and use strong action verbs. Return only the improved bullet point or description:\n\n"${description}"`;

  // Get the access token for authentication
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  // Only set Authorization if we have a token!
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

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
    // Show a more specific error if auth is the problem
    throw new Error(
      "Authorization error: Please make sure you are logged in, or contact support if this issue persists."
    );
  } else {
    throw new Error(data.error || JSON.stringify(data) || "No suggestions returned from Gemini. Try again later.");
  }
}
