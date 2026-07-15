import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { checkRateLimit, rateLimitResponse } from '../_shared/rateLimiter.ts'
import { AIKeyManager } from '../_shared/aiKeyManager.ts'
import { getAnyActiveKey, callTextModel } from '../_shared/aiProviders.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['application/pdf'];

// Rate limit: 5 uploads per user per hour
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60_000;

// JSON schema prompt shared by both paths
const JSON_SCHEMA_PROMPT = `You are a resume parser. Extract structured information from this resume and return it as valid JSON.

Return the data in this EXACT format (no additional text, only JSON):
{
  "personal": {
    "name": "Full Name",
    "email": "email@example.com", 
    "phone": "phone number",
    "address": "full address",
    "linkedin": "linkedin URL",
    "website": "portfolio/website URL",
    "summary": "professional summary or objective"
  },
  "experience": [
    {
      "title": "job title",
      "company": "company name", 
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "current": false,
      "description": "job description and achievements"
    }
  ],
  "education": [
    {
      "degree": "degree name",
      "institution": "school name",
      "startDate": "YYYY-MM", 
      "endDate": "YYYY-MM",
      "gpa": "GPA if mentioned"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "projects": [
    {
      "name": "project name",
      "description": "project description", 
      "technologies": "technologies used",
      "url": "project URL if available"
    }
  ],
  "certifications": [
    {
      "name": "certification name",
      "issuer": "issuing organization",
      "date": "YYYY-MM",
      "url": "credential URL if available"
    }
  ],
  "languages": [
    {
      "language": "language name",
      "proficiency": "proficiency level"
    }
  ]
}

Only return valid JSON. If a section is not found, use empty arrays or empty strings. Extract ALL available information from the resume.`

function parseExtractedJson(rawText: string) {
  try {
    const cleanedText = rawText.replace(/```json|```/g, '').trim()
    const data = JSON.parse(cleanedText)
    if (typeof data.skills === 'string') {
      data.skills = data.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
    }
    return data
  } catch (_e) {
    return {
      personal: { name: "", email: "", phone: "", address: "", linkedin: "", website: "", summary: "" },
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      languages: []
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Authenticate - require valid auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const userId = claimsData.claims.sub as string;

    // Rate limit
    const rl = checkRateLimit(`extract-resume:${userId}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (!rl.allowed) {
      return rateLimitResponse(corsHeaders, rl.resetAt);
    }

    // Resolve AI key: prefer Gemini (multimodal), then any other provider (text-only path)
    const keyManager = new AIKeyManager(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    const geminiKey = (await keyManager.getActiveKey('gemini')) ?? Deno.env.get('GEMINI_API_KEY')

    // If no Gemini key, check for any other active provider
    const fallbackResolved = geminiKey ? null : await getAnyActiveKey(keyManager)

    if (!geminiKey && !fallbackResolved) {
      console.log('No AI API key is configured')
      return new Response(JSON.stringify({
        success: false,
        error: 'AI resume parsing is not configured. Add a Gemini, DeepSeek, or OpenAI key in Admin → AI Management.',
        requiresApiKey: true
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return new Response(JSON.stringify({ success: false, error: 'No file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ success: false, error: 'File too large. Maximum size is 10MB.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid file type. Only PDF files are allowed.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const arrayBuffer = await file.arrayBuffer()

    // BRANCH 1: Gemini key available → raw-PDF multimodal path (unchanged)
    if (geminiKey) {
      const bytes = new Uint8Array(arrayBuffer)
      const CHUNK_SIZE = 8192
      let binary = ''
      for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
        binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK_SIZE))
      }
      const base64 = btoa(binary)

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: JSON_SCHEMA_PROMPT },
              {
                inline_data: {
                  mime_type: "application/pdf",
                  data: base64
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4000,
          }
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Gemini API error:', errorText)
        throw new Error(`Gemini API error: ${response.status}`)
      }

      const aiResult = await response.json()

      if (!aiResult.candidates || !aiResult.candidates[0] || !aiResult.candidates[0].content) {
        throw new Error('Invalid response from Gemini API')
      }

      const extractedText = aiResult.candidates[0].content.parts[0].text
      const extractedData = parseExtractedJson(extractedText)

      return new Response(JSON.stringify({
        success: true,
        data: extractedData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // BRANCH 2: No Gemini key → text-extraction path via unpdf + any active provider
    const { extractText, getDocumentProxy } = await import('https://esm.sh/unpdf')
    const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer))
    const { text: pdfText } = await extractText(pdf, { mergePages: true })
    const trimmedText = (pdfText ?? '').trim().slice(0, 15000)

    if (trimmedText.length < 100) {
      return new Response(JSON.stringify({
        success: false,
        error: 'This PDF appears to be scanned/image-based. Add a Google Gemini key to parse scanned PDFs.'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const textPrompt = JSON_SCHEMA_PROMPT + '\n\nRESUME TEXT:\n' + trimmedText

    const result = await callTextModel(fallbackResolved!.provider, fallbackResolved!.key, textPrompt, {
      maxTokens: 4000,
      temperature: 0.1,
    })

    if (!result.text) {
      throw new Error(result.error ?? 'No response from AI provider')
    }

    const extractedData = parseExtractedJson(result.text)

    return new Response(JSON.stringify({
      success: true,
      data: extractedData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in extract-resume-data function:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to extract resume data'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
