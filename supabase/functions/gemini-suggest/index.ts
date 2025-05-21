
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

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
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Prompt is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    // Ignore Authorization header, treat as public
    const apiRequest = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );
    const apiData = await apiRequest.json();
    console.log("[Gemini] API response", JSON.stringify(apiData));
    let errorDetail = apiData.error?.message || apiData.error || undefined;

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
    } else if (errorDetail) {
      return new Response(
        JSON.stringify({ error: errorDetail }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "No suggestion returned from Gemini. Raw response: " + JSON.stringify(apiData) }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.log("[Gemini] Function error", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
