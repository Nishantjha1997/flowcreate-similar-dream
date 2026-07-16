import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Share2,
  Copy,
  Link2,
  Trash2,
  Loader2,
  MessageSquare,
  Clock,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { useResumeSharing, useResumeShares, ResumeShare } from '@/hooks/useResumeSharing';

interface ShareManagementProps {
  resumeId?: string | null;
  resumeName?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ShareManagement({ resumeId, resumeName, trigger, open: controlledOpen, onOpenChange: controlledOnOpenChange }: ShareManagementProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  const [allowComments, setAllowComments] = useState(true);
  const { createShare, toggleShareActive, toggleAllowComments, deleteShare, isCreating } = useResumeSharing();
  const { data: shares, isLoading } = useResumeShares(resumeId ?? undefined);

  const handleCreateShare = async () => {
    if (!resumeId) {
      toast.error('Please save your resume first before sharing.');
      return;
    }
    await createShare(resumeId, { allowComments });
    setAllowComments(true);
  };

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/r/${token}`;
    navigator.clipboard.writeText(url);
    toast.success('Share link copied to clipboard!');
  };

  const handleOpenLink = (token: string) => {
    window.open(`/r/${token}`, '_blank');
  };

  const activeShares = shares?.filter(s => s.is_active) ?? [];
  const inactiveShares = shares?.filter(s => !s.is_active) ?? [];

  const isControlled = controlledOpen !== undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Only render DialogTrigger when we have a visible trigger (not in controlled mode without one) */}
      {(trigger || !isControlled) && (
        <DialogTrigger asChild>
          {trigger || (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full px-4 h-8 text-xs font-medium border-border/50 hover:bg-muted/60 transition-all duration-200"
          >
            <Share2 className="h-3.5 w-3.5 mr-1.5" />
            Share
          </Button>
        )}
      </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Share2 className="h-5 w-5" />
            Share Resume
          </DialogTitle>
          <DialogDescription>
            {resumeName
              ? `Generate a shareable link for "${resumeName}"`
              : 'Generate a shareable link for this resume'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Create New Share */}
          {!resumeId ? (
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Save your resume first to generate a share link.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border p-4 space-y-3">
              <h4 className="text-sm font-semibold">Create New Share Link</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="allowComments" className="text-sm cursor-pointer">
                    Allow comments
                  </Label>
                </div>
                <Switch
                  id="allowComments"
                  checked={allowComments}
                  onCheckedChange={setAllowComments}
                />
              </div>
              <Button
                onClick={handleCreateShare}
                disabled={isCreating}
                className="w-full"
                size="sm"
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Link2 className="h-4 w-4 mr-2" />
                )}
                {isCreating ? 'Creating...' : 'Generate Share Link'}
              </Button>
            </div>
          )}

          {/* Existing Shares */}
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : shares && shares.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Active Links ({activeShares.length})</h4>
              <ScrollArea className="max-h-60 pr-1">
                <div className="space-y-2">
                  {activeShares.map((share) => (
                    <ShareRow
                      key={share.id}
                      share={share}
                      onCopy={handleCopyLink}
                      onOpen={handleOpenLink}
                      onToggleActive={(active) => toggleShareActive(share.id, active)}
                      onToggleComments={(comments) => toggleAllowComments(share.id, comments)}
                      onDelete={() => deleteShare(share.id)}
                    />
                  ))}
                  {inactiveShares.length > 0 && (
                    <>
                      <Separator className="my-2" />
                      <h4 className="text-xs font-medium text-muted-foreground">
                        Inactive Links ({inactiveShares.length})
                      </h4>
                      {inactiveShares.map((share) => (
                        <ShareRow
                          key={share.id}
                          share={share}
                          onCopy={handleCopyLink}
                          onOpen={handleOpenLink}
                          onToggleActive={(active) => toggleShareActive(share.id, active)}
                          onToggleComments={(comments) => toggleAllowComments(share.id, comments)}
                          onDelete={() => deleteShare(share.id)}
                        />
                      ))}
                    </>
                  )}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No share links yet. Generate one to share your resume.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ShareRow({
  share,
  onCopy,
  onOpen,
  onToggleActive,
  onToggleComments,
  onDelete,
}: {
  share: ResumeShare;
  onCopy: (token: string) => void;
  onOpen: (token: string) => void;
  onToggleActive: (active: boolean) => void;
  onToggleComments: (comments: boolean) => void;
  onDelete: () => void;
}) {
  const isExpired = share.expires_at && new Date(share.expires_at) < new Date();
  const shortToken = share.share_token.slice(0, 8) + '...';

  return (
    <div
      className={`rounded-lg border p-3 space-y-2 transition-all ${
        share.is_active ? 'border-border/60' : 'border-border/30 bg-muted/20'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono truncate max-w-[120px]">
            {shortToken}
          </code>
          {share.allow_comments && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              <MessageSquare className="h-2.5 w-2.5 mr-1" />
              Comments
            </Badge>
          )}
          {isExpired && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
              <Clock className="h-2.5 w-2.5 mr-1" />
              Expired
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onCopy(share.share_token)}
            title="Copy link"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onOpen(share.share_token)}
            title="Open in new tab"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={onDelete}
            title="Delete share"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <button
          onClick={() => onToggleActive(!share.is_active)}
          className={`flex items-center gap-1 transition-colors ${
            share.is_active
              ? 'text-green-600 hover:text-green-700'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {share.is_active ? (
            <Check className="h-3 w-3" />
          ) : (
            <X className="h-3 w-3" />
          )}
          {share.is_active ? 'Active' : 'Inactive'}
        </button>
        <span className="text-muted-foreground">|</span>
        <button
          onClick={() => onToggleComments(!share.allow_comments)}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageSquare className="h-3 w-3" />
          {share.allow_comments ? 'Comments on' : 'Comments off'}
        </button>
        {share.created_at && (
          <>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground">
              {new Date(share.created_at).toLocaleDateString()}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
