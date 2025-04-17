
// Gemini API utility for AI-powered resume enhancement

interface GeminiResponse {
  text: string;
  error?: string;
}

// Default API key - typically would be stored more securely
const DEFAULT_API_KEY = "AIzaSyCSerNeKYTcl6cnQOrCX30HZVlfg5sqYMc";

export async function enhanceWithGemini(
  prompt: string, 
  apiKey: string = DEFAULT_API_KEY
): Promise<GeminiResponse> {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          }
        }),
      }
    );

    const data = await response.json();
    
    if (data.error) {
      return {
        text: "",
        error: data.error.message || "Error generating content"
      };
    }

    // Extract the generated text from the response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return { text };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return {
      text: "",
      error: "Failed to connect to AI service. Please try again."
    };
  }
}

// Available Gemini models
export const availableModels = [
  { id: "gemini-pro", name: "Gemini Pro", description: "Best for text generation and creative content" },
  { id: "gemini-pro-vision", name: "Gemini Pro Vision", description: "Best for image and text analysis (not used in this app)" }
];

// Predefined AI enhancement prompts
export const aiPrompts = {
  improveSummary: (currentSummary: string) => 
    `Improve this professional summary to be more impactful and concise (max 3-4 sentences): "${currentSummary}"`,
  
  enhanceExperience: (jobTitle: string, responsibilities: string) => 
    `Rewrite this job description to highlight achievements and use strong action verbs. For position: "${jobTitle}". Current description: "${responsibilities}"`,
  
  generateSkills: (jobTitle: string, experience: string) => 
    `Suggest 5-8 relevant professional skills for a ${jobTitle} based on this experience: "${experience}". Format as a comma-separated list.`,

  improveEducation: (degree: string, field: string, description: string) => 
    `Enhance this education description to better highlight academic achievements. Degree: ${degree} in ${field}. Current description: "${description}"`,
  
  suggestJobTitle: (responsibilities: string) => 
    `Suggest an appropriate job title based on these responsibilities: "${responsibilities}"`
}
