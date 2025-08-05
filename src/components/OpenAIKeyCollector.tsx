import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const OpenAIKeyCollector = () => {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>OpenAI API Key Required</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          To use the PDF parsing feature, an OpenAI API key is required. Please add it to your Supabase Edge Function secrets.
        </p>
      </CardContent>
    </Card>
  );
};