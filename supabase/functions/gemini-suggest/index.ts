
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { AIKeyManager } from "../_shared/aiKeyManager.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FALLBACK_GEMINI_KEY = Deno.env.get("GEMINI_API_KEY");

const MAX_PROMPT_LENGTH = 5000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const body = await req.json();
    const prompt = body?.prompt;

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Prompt is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Prompt must be less than ${MAX_PROMPT_LENGTH} characters.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length === 0) {
      return new Response(
        JSON.stringify({ error: "Prompt cannot be empty." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get API key from database
    const keyManager = new AIKeyManager(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    let GEMINI_API_KEY = await keyManager.getActiveKey('gemini');
    
    if (!GEMINI_API_KEY) {
      console.log('[Gemini] No DB key found, using environment variable');
      GEMINI_API_KEY = FALLBACK_GEMINI_KEY;
    }
    
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "No Gemini API key configured. Please add one in Admin > AI Management." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Try with primary key
    let apiRequest = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: trimmedPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        }),
      }
    );
    
    let apiData = await apiRequest.json();
    
    // If primary key failed, try fallback
    if (apiData.error && (apiData.error.status === 'PERMISSION_DENIED' || apiData.error.status === 'INVALID_ARGUMENT')) {
      console.log('[Gemini] Primary key failed, trying fallback');
      const fallbackKey = await keyManager.getFallbackKey('gemini');
      
      if (fallbackKey) {
        apiRequest = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${fallbackKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: trimmedPrompt }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000,
              }
            }),
          }
        );
        apiData = await apiRequest.json();
      }
    }
    
    if (
      apiData &&
      apiData.candidates &&
      Array.isArray(apiData.candidates) &&
      apiData.candidates[0]?.content?.parts[0]?.text
    ) {
      return new Response(
        JSON.stringify({ suggestion: apiData.candidates[0].content.parts[0].text }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (apiData.error?.message || apiData.error) {
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "No suggestion returned from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.log("[Gemini] Function error", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
