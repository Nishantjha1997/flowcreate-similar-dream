import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  User,
  Mail,
  MessageCircle,
  X,
} from 'lucide-react';
import { ResumeComment, useResumeSharing } from '@/hooks/useResumeSharing';
import { cn } from '@/lib/utils';

interface CommentPanelProps {
  shareId: string;
  comments: ResumeComment[];
  isLoading: boolean;
  allowComments: boolean;
  isOwner: boolean;
  className?: string;
}

export function CommentPanel({
  shareId,
  comments,
  isLoading,
  allowComments,
  isOwner,
  className,
}: CommentPanelProps) {
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addComment, resolveComment } = useResumeSharing();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;

    setIsSubmitting(true);
    const result = await addComment(shareId, authorName.trim(), content.trim(), authorEmail.trim() || undefined);
    setIsSubmitting(false);

    if (result) {
      setContent('');
      // Keep name and email for convenience
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-sm">
            Comments
            {comments.length > 0 && (
              <span className="ml-1.5 text-muted-foreground font-normal">
                ({comments.length})
              </span>
            )}
          </h3>
        </div>
      </div>

      {/* Comments List */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse space-y-3 w-full">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-24 bg-muted rounded" />
                      <div className="h-3 w-full bg-muted rounded" />
                      <div className="h-3 w-3/4 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No comments yet</p>
              {allowComments && (
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Be the first to leave feedback!
                </p>
              )}
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className={cn(
                  'flex gap-3 p-3 rounded-lg transition-colors',
                  comment.is_resolved
                    ? 'bg-muted/30'
                    : 'bg-muted/50 hover:bg-muted/70'
                )}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                    {getInitials(comment.author_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold truncate">
                      {comment.author_name}
                    </span>
                    {comment.author_email && (
                      <span className="text-xs text-muted-foreground truncate">
                        {comment.author_email}
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground/60">
                      {getTimeAgo(comment.created_at)}
                    </span>
                  </div>
                  {comment.section_ref && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 mt-1 mb-1"
                    >
                      Re: {comment.section_ref}
                    </Badge>
                  )}
                  <p
                    className={cn(
                      'text-sm mt-1',
                      comment.is_resolved && 'line-through text-muted-foreground'
                    )}
                  >
                    {comment.content}
                  </p>
                  {isOwner && !comment.is_resolved && (
                    <button
                      onClick={() => resolveComment(comment.id)}
                      className="mt-2 text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Resolve
                    </button>
                  )}
                  {comment.is_resolved && (
                    <span className="mt-1 text-[10px] text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Comment Form */}
      {allowComments && (
        <div className="border-t shrink-0">
          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <div className="flex gap-2">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="commentName" className="text-xs">
                  Your name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="commentName"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="John Doe"
                  className="h-8 text-sm"
                  required
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="commentEmail" className="text-xs">
                  Email <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="commentEmail"
                  type="email"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="commentContent" className="text-xs">
                Your feedback <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="commentContent"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts on this resume..."
                className="min-h-[60px] text-sm resize-none"
                rows={2}
                required
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !authorName.trim() || !content.trim()}
                className="rounded-full px-4"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    Send Feedback
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {!allowComments && (
        <div className="border-t p-4 shrink-0">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <X className="h-4 w-4" />
            Comments are disabled for this share
          </div>
        </div>
      )}
    </div>
  );
}
