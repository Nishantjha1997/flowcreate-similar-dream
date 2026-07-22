import { useId, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getEdgeFunctionErrorMessage } from '@/utils/edgeFunctionError';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  rows?: number;
  placeholder?: string;
  textareaClassName?: string;
}

export const JobDescriptionInput = ({
  value,
  onChange,
  disabled,
  rows = 8,
  placeholder = 'Paste the full job description here, or upload a file below...',
  textareaClassName,
}: JobDescriptionInputProps) => {
  const inputId = useId();
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isText = file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt');
    const isPdf = file.type === 'application/pdf';
    if (!isText && !isPdf) {
      toast.error('Please upload a PDF or plain text (.txt) file.');
      event.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB.');
      event.target.value = '';
      return;
    }

    setUploading(true);
    try {
      let text: string;
      if (isText) {
        text = await file.text();
      } else {
        const formData = new FormData();
        formData.append('file', file);
        const { data, error } = await supabase.functions.invoke('extract-text-from-file', {
          body: formData,
        });
        if (error) throw new Error(await getEdgeFunctionErrorMessage(error, 'Failed to read the file'));
        if (data?.error) throw new Error(data.error as string);
        text = (data?.text as string) || '';
      }

      if (!text.trim()) {
        toast.error('Could not extract any text from that file. Try pasting it instead.');
        return;
      }

      onChange(text);
      setFileName(file.name);
      toast.success('Job description loaded from file.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to read the file.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setFileName(null);
        }}
        rows={rows}
        disabled={disabled}
        className={textareaClassName}
      />
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept=".pdf,.txt,text/plain,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
          id={inputId}
          disabled={uploading || disabled}
        />
        <label htmlFor={inputId}>
          <Button asChild variant="outline" size="sm" disabled={uploading || disabled} className="h-7 text-xs">
            <span className="cursor-pointer gap-1.5 max-w-[220px] truncate">
              {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
              {fileName ?? 'Upload JD file (PDF/.txt)'}
            </span>
          </Button>
        </label>
      </div>
    </div>
  );
};
