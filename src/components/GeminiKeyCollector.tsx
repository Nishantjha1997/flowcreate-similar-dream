import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const GeminiKeyCollector = () => {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Gemini API Key Required</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          To use the PDF parsing feature, a Gemini API key is required. Please add it to your Supabase Edge Function secrets.
        </p>
      </CardContent>
    </Card>
  );
};