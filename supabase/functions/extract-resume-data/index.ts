import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set')
    }

    // Parse the multipart form data
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      throw new Error('No file provided')
    }

    // Convert PDF to base64 for Gemini
    const arrayBuffer = await file.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

    // Use Gemini to extract structured data from the PDF
    const prompt = `You are a resume parser. Extract structured information from this resume PDF and return it as valid JSON.

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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
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
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
    }

    const aiResult = await response.json()
    console.log('Gemini response:', JSON.stringify(aiResult, null, 2))
    
    if (!aiResult.candidates || !aiResult.candidates[0] || !aiResult.candidates[0].content) {
      throw new Error('Invalid response from Gemini API')
    }
    
    const extractedText = aiResult.candidates[0].content.parts[0].text
    console.log('Extracted text:', extractedText)

    // Parse the JSON response
    let extractedData
    try {
      // Clean the response to ensure it's valid JSON
      const cleanedText = extractedText.replace(/```json|```/g, '').trim()
      extractedData = JSON.parse(cleanedText)
      
      // Ensure skills is an array
      if (typeof extractedData.skills === 'string') {
        extractedData.skills = extractedData.skills.split(',').map((skill: string) => skill.trim()).filter(Boolean)
      }
      
      console.log('Parsed extracted data:', JSON.stringify(extractedData, null, 2))
    } catch (e) {
      console.error('Error parsing JSON:', e)
      console.error('Raw text:', extractedText)
      
      // Fallback: try to extract basic info from text
      extractedData = {
        personal: {
          name: "",
          email: "",
          phone: "",
          address: "",
          linkedin: "",
          website: "",
          summary: ""
        },
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        languages: []
      }
    }

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
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})