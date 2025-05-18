
/**
 * Utility for requesting resume enhancements from Gemini API.
 * You MUST set the GEMINI_API_KEY in your environment/secrets!
 */
export async function fetchGeminiSuggestion(description: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not set. Please configure it securely in your project settings.');
  }

  const prompt = `Enhance the following job description to sound more professional, impactful, and results-driven for a resume. Keep it concise and use strong action verbs. Return only the improved bullet point or description:\n\n"${description}"`;

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  const data = await response.json();
  if (data && data.candidates && data.candidates.length > 0) {
    return data.candidates[0].content.parts[0].text;
  } else {
    throw new Error('No suggestions returned from Gemini. Try again later.');
  }
}
