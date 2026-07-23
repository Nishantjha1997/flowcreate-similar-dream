import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { CoverLetterEditor } from '@/components/cover-letter/CoverLetterEditor';
import { CoverLetterPreview } from '@/components/cover-letter/CoverLetterPreview';
import { useCoverLetterData } from '@/hooks/useCoverLetterData';
import { usePDFGenerator } from '@/hooks/usePDFGenerator';
import { usePageMeta } from '@/hooks/usePageMeta';
import { DocumentExportActions } from '@/components/export/DocumentExportActions';
import { SectionBoundary } from '@/components/ui/section-boundary';

const CoverLetterBuilder = () => {
  const navigate = useNavigate();
  const previewRef = useRef<HTMLDivElement>(null);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  usePageMeta({
    title: 'Cover Letter Builder',
    description: 'Write a compelling, AI-assisted cover letter that matches your resume. Free, fast, and ready to download as PDF.',
  });
  const {
    formData,
    setFormData,
    isSaving,
    saveLetter,
    isLoading,
    editId,
    userResumes,
    userId,
  } = useCoverLetterData();

  const { isGenerating, generatePDF, printResume } = usePDFGenerator(
    `${formData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'cover_letter'}.pdf`
  );

  const handleDownload = () => {
    if (previewRef.current) {
      generatePDF(previewRef.current);
    } else {
      toast.error('Could not generate PDF. Please try again.');
    }
  };

  const handleAtsDownload = () => {
    printResume(previewRef.current);
  };

  const handleTextDownload = () => {
    const blob = new Blob([formData.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'cover_letter'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    const savedId = await saveLetter();
    // On the very first save of a new letter there's no ?edit= in the URL
    // yet, so the next save would insert another row instead of updating
    // this one - lock the URL to the new id as soon as we have it.
    if (savedId && !editId) {
      navigate(`/cover-letter-builder?edit=${savedId}`, { replace: true });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground">Loading cover letter...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-muted-foreground">Please log in to create cover letters.</p>
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Top bar */}
      <div className="border-b border-border/50 bg-card/50 px-4 py-2 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/account')}
            className="h-8 gap-1 text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>
          <span className="text-sm font-medium text-foreground">
            Cover Letter Builder
          </span>
        </div>
        <DocumentExportActions
          onSemanticExport={handleAtsDownload}
          onImageExport={handleDownload}
          isImageGenerating={isGenerating}
        />
        <Button variant="outline" size="sm" onClick={handleTextDownload} className="h-8 text-xs">TXT</Button>
      </div>

      {/* Main split layout */}
      <div className="flex flex-1 overflow-hidden">
        <div className="lg:hidden flex absolute top-[6.1rem] right-3 z-10 rounded-md border bg-background p-1 shadow-sm">
          <Button size="sm" variant={mobileTab === 'edit' ? 'default' : 'ghost'} onClick={() => setMobileTab('edit')}><Pencil className="mr-1 h-3 w-3" />Edit</Button>
          <Button size="sm" variant={mobileTab === 'preview' ? 'default' : 'ghost'} onClick={() => setMobileTab('preview')}><Eye className="mr-1 h-3 w-3" />Preview</Button>
        </div>
        {/* Left: Editor */}
        <div className={`${mobileTab === 'edit' ? 'flex' : 'hidden'} lg:flex w-full lg:w-[420px] xl:w-[480px] border-r border-border/50 bg-card/30 overflow-y-auto flex-shrink-0`}>
          <SectionBoundary name="Cover letter editor">
            <CoverLetterEditor
              formData={formData}
              setFormData={setFormData}
              isSaving={isSaving}
              onSave={handleSave}
              userResumes={userResumes}
            />
          </SectionBoundary>
        </div>

        {/* Right: Preview */}
        <div className={`${mobileTab === 'preview' ? 'flex' : 'hidden'} lg:flex flex-1 items-start justify-center p-8 overflow-auto bg-muted/20`}>
          <SectionBoundary name="Cover letter preview">
            <CoverLetterPreview
              formData={formData}
              previewRef={previewRef}
            />
          </SectionBoundary>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterBuilder;
