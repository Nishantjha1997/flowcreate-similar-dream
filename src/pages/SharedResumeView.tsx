import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useShareByToken, useShareComments } from '@/hooks/useResumeSharing';
import { CommentPanel } from '@/components/sharing/CommentPanel';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Eye,
  AlertTriangle,
  Link2,
  Home,
  MessageSquare,
} from 'lucide-react';
import { ResumeData } from '@/utils/types';
import { resolveTemplateKey } from '@/templates/registry';

import { SITE_URL } from '@/lib/seo';

const SHARE_URL = import.meta.env.VITE_SUPABASE_URL 
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-resume-view`
  : null;

export default function SharedResumeView() {
  const { token } = useParams<{ token: string }>();

  const { data, isLoading, isError } = useShareByToken(token);
  const { data: comments, isLoading: commentsLoading } = useShareComments(data?.share?.id);

  const trackedRef = useRef(false);

  // Track view on mount
  useEffect(() => {
    if (!token || trackedRef.current) return;
    trackedRef.current = true;

    if (SHARE_URL) {
      fetch(SHARE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ share_token: token }),
      }).catch(() => {
        // Best-effort tracking — never block the page
      });
    }
  }, [token]);

  const resumeData = useMemo(() => {
    if (!data?.resume?.resume_data) return null;
    return data.resume.resume_data as unknown as ResumeData;
  }, [data]);

  // ── Loading Skeleton ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">FlowCreate</span>
          </Link>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-[600px] w-full rounded-xl" />
            </div>
            <div className="lg:col-span-1 space-y-3">
              <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Error / Not Found ──
  if (isError || (!isLoading && !data)) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">FlowCreate</span>
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">Link Not Found</h2>
            <p className="text-muted-foreground mb-6">
              This share link may have been deactivated, expired, or never existed.
            </p>
            <Link to="/">
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ── Expired ──
  if (data.expired) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">FlowCreate</span>
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold mb-2">Link Expired</h2>
            <p className="text-muted-foreground mb-6">
              This share link has expired. Ask the owner to create a new one.
            </p>
            <Link to="/">
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ── No Resume Data ──
  if (!resumeData) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">FlowCreate</span>
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-bold mb-2">Resume Unavailable</h2>
            <p className="text-muted-foreground mb-6">
              The resume data is no longer available.
            </p>
            <Link to="/">
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const resumeName = resumeData.personal?.name || 'Shared Resume';
  const templateKey = resolveTemplateKey(data.resume?.template_id || 'modern');

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <span className="text-base sm:text-lg font-bold tracking-tight hidden sm:block">
                FlowCreate
              </span>
            </Link>
            <span className="text-muted-foreground hidden sm:block">/</span>
            <h1 className="text-sm sm:text-base font-semibold truncate">
              {resumeName}
            </h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Badge variant="secondary" className="text-xs gap-1">
              <Eye className="h-3 w-3" />
              View Only
            </Badge>
            {data.share.allow_comments && (
              <Badge variant="outline" className="text-xs gap-1">
                <MessageSquare className="h-3 w-3" />
                Feedback Open
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Resume Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-6 sm:p-10">
                <SharedResumeContent resumeData={resumeData} templateKey={templateKey} />
              </div>
            </div>

            {/* Mobile: Show comments below resume on small screens */}
            <div className="mt-6 lg:hidden">
              <div className="bg-background rounded-xl border shadow-sm overflow-hidden min-h-[300px]">
                <CommentPanel
                  shareId={data.share.id}
                  comments={comments || []}
                  isLoading={commentsLoading}
                  allowComments={data.share.allow_comments}
                  isOwner={false}
                />
              </div>
            </div>
          </div>

          {/* Desktop: Comment Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-20 bg-background rounded-xl border shadow-sm overflow-hidden h-[calc(100vh-8rem)] flex flex-col">
              <CommentPanel
                shareId={data.share.id}
                comments={comments || []}
                isLoading={commentsLoading}
                allowComments={data.share.allow_comments}
                isOwner={false}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background px-4 py-4 mt-auto">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Created with{' '}
            <Link to="/" className="text-primary hover:underline font-medium">
              FlowCreate
            </Link>
          </span>
          <span>Share token: {token?.slice(0, 8)}...</span>
        </div>
      </footer>
    </div>
  );
}

/**
 * Renders the resume content inside a shared view.
 * Uses a deferred import of ResumeTemplate to avoid bundling it in the main chunk.
 */
function SharedResumeContent({
  resumeData,
  templateKey,
}: {
  resumeData: ResumeData;
  templateKey: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [Component, setComponent] = useState<React.ComponentType<{
    data: ResumeData;
    templateName: string;
  }> | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import('@/utils/resumeTemplates')
      .then((mod) => {
        if (!cancelled) setComponent(() => mod.default);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => { cancelled = true; };
  }, []);

  if (loadError || !resumeData) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground text-sm">Unable to render resume.</p>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded" />
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-4 w-full bg-muted rounded mt-4" />
        <div className="h-4 w-3/4 bg-muted rounded" />
        <div className="h-4 w-5/6 bg-muted rounded" />
        <div className="h-4 w-2/3 bg-muted rounded" />
        <div className="mt-6 space-y-3">
          <div className="h-4 w-40 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      <Component data={resumeData} templateName={templateKey} />
    </div>
  );
}
