
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
  if (data.suggestion) {
    return data.suggestion;
  } else {
    throw new Error(data.error || "No suggestions returned from Gemini. Try again later.");
  }
}
