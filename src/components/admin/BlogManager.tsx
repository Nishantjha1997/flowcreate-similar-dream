import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Edit, Trash2, Eye, Search, RefreshCw, Sparkles,
  Bold, Italic, List, ListOrdered,
  Link2, Image, Send, Loader2, BookOpen, Lightbulb, Wand2
} from 'lucide-react';

interface BlogPost {
  id: string; slug: string; title: string; excerpt: string; description: string;
  content: string; category: string; status: 'draft' | 'published';
  keywords: string[]; author: string; read_time: string; image_url: string;
  created_at: string; updated_at: string; published_at: string | null;
}

const categories = ['Resume Tips', 'Career Advice', 'Job Search', 'Interview Tips', 'Industry Insights'];

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function callGemini(prompt: string, maxTokens?: number): Promise<string> {
  const body: Record<string, unknown> = { prompt };
  if (maxTokens) body.maxTokens = maxTokens;
  const { data, error } = await supabase.functions.invoke('gemini-suggest', { body });
  if (error) throw new Error(error.message || 'AI request failed');
  if (!data?.suggestion) throw new Error('No response from AI');
  return data.suggestion as string;
}

export function BlogManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const editorRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [editorTab, setEditorTab] = useState('edit');
  const [saving, setSaving] = useState(false);

  // AI flow state
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [aiStep, setAiStep] = useState<'ideas' | 'generate'>('ideas');
  const [aiIdeas, setAiIdeas] = useState<string[]>([]);
  const [aiTopic, setAiTopic] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const { data: posts = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
    retry: false,
  });

  const filtered = posts.filter(p =>
    (statusFilter === 'all' || p.status === statusFilter) &&
    (categoryFilter === 'all' || p.category === categoryFilter) &&
    (!searchTerm || p.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // ─── Editor toolbar ──────────────────────────────────────
  const execCmd = useCallback((cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
  }, []);
  const insertLink = () => { const url = prompt('Enter URL:'); if (url) execCmd('createLink', url); };
  const insertImage = () => { const url = prompt('Enter image URL:'); if (url) execCmd('insertImage', url); };
  const syncContent = () => {
    if (editorRef.current && editingPost) {
      setEditingPost({ ...editingPost, content: editorRef.current.innerHTML });
    }
  };
  useEffect(() => {
    if (editorRef.current && editingPost) editorRef.current.innerHTML = editingPost.content || '';
  }, [editingPost?.id]);

  // ─── Save ───────────────────────────────────────────────
  const savePost = async (status: 'draft' | 'published') => {
    if (!editingPost) return;
    syncContent();
    const content = editorRef.current?.innerHTML || editingPost.content;
    if (!editingPost.title?.trim()) { toast({ title: 'Title required', variant: 'destructive' }); return; }

    const payload = {
      title: editingPost.title, slug: editingPost.slug || slugify(editingPost.title),
      excerpt: editingPost.excerpt || '', description: editingPost.description || '',
      content, category: editingPost.category || 'Resume Tips', status,
      keywords: editingPost.keywords || [], author: editingPost.author || 'FlowCreate Team',
      read_time: editingPost.read_time || '5 min read', image_url: editingPost.image_url || '',
      published_at: status === 'published' ? new Date().toISOString() : editingPost.published_at,
      updated_at: new Date().toISOString(),
    };

    setSaving(true);
    try {
      if (editingPost.id) {
        const { error } = await supabase.from('blog_posts').update(payload).eq('id', editingPost.id);
        if (error) throw error;
        toast({ title: 'Post updated' });
      } else {
        const { error } = await supabase.from('blog_posts').insert(payload);
        if (error) throw error;
        toast({ title: `Post ${status === 'published' ? 'published' : 'saved as draft'}!` });
      }
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      setEditingPost(null);
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Save failed', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post permanently?')) return;
    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Post deleted' });
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    } catch { toast({ title: 'Delete failed', variant: 'destructive' }); }
  };

  const toggleStatus = async (post: BlogPost) => {
    const ns = post.status === 'published' ? 'draft' : 'published';
    try {
      const { error } = await supabase.from('blog_posts').update({
        status: ns, published_at: ns === 'published' ? new Date().toISOString() : post.published_at,
      }).eq('id', post.id);
      if (error) throw error;
      toast({ title: ns === 'published' ? 'Published!' : 'Unpublished' });
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    } catch (err: unknown) {
      toast({ title: 'Failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    }
  };

  // ─── AI Flow ────────────────────────────────────────────
  const startAiFlow = () => {
    setShowAiDialog(true); setAiStep('ideas'); setAiIdeas([]); setAiTopic(''); setAiError('');
  };

  const generateIdeas = async () => {
    setAiLoading(true); setAiError('');
    try {
      const titles = posts.map(p => p.title).join('; ');
      const result = await callGemini(`You are a blog strategist for a resume builder website. Based on these existing articles: [${titles || 'none yet'}], suggest 5 NEW blog topic titles that fill content gaps. Each title should target a specific job-seeker keyword. Return exactly 5 titles, one per line, no numbers or bullets.`);
      setAiIdeas(result.split('\n').map(s => s.replace(/^[\d.\-\s]+/, '').trim()).filter(s => s.length > 5));
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'Failed to generate ideas');
    } finally { setAiLoading(false); }
  };

  const generateArticle = async () => {
    if (!aiTopic.trim()) { setAiError('Enter or select a topic first'); return; }
    setAiLoading(true); setAiError('');
    try {
      const prompt = `You are an expert SEO content writer for FlowCreate, a free online resume builder.

Write a comprehensive, fully SEO-optimized blog article titled "${aiTopic}".

CRITICAL REQUIREMENTS:
1. Start with <!-- meta-desc: [compelling 150-160 char meta description with primary keyword] -->
2. Use proper HTML formatting: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <a href="...">
3. Include 4-6 clearly separated sections with H2 headings.
4. End with <h2>Frequently Asked Questions</h2> followed by 3-5 <h3>Q: question?</h3><p>A: answer</p> pairs.
5. Naturally link to: <a href="/resume-builder">free resume builder</a>, <a href="/templates">resume templates</a>, <a href="/pricing">pricing</a>, <a href="/help">help center</a>.
6. Target primary keyword in first 100 words, at least one H2, and conclusion.
7. Include a compelling call-to-action at the end.
8. Length: 800-1200 words. Tone: professional, helpful, authoritative.
9. Return raw HTML only — no markdown code blocks, no explanations.`;

      const htmlRaw = await callGemini(prompt, 4000);
      let html = htmlRaw.replace(/```html|```/g, '').trim();
      const metaMatch = html.match(/<!--\s*meta-desc:\s*(.*?)\s*-->/i);
      const metaDesc = metaMatch ? metaMatch[1].trim() : '';
      html = html.replace(/<!--\s*meta-desc:.*?-->/gi, '').trim();

      const plainText = html.replace(/<[^>]*>/g, '');
      const wordCount = plainText.split(/\s+/).filter(Boolean).length;
      const excerpt = plainText.slice(0, 160).replace(/\s+/g, ' ').trim() + '...';

      // Create a new draft post pre-filled with AI content
      setEditingPost({
        id: '', slug: slugify(aiTopic), title: aiTopic, excerpt, description: metaDesc || excerpt,
        content: html, category: 'Resume Tips', status: 'draft', keywords: [],
        author: 'FlowCreate Team', read_time: `${Math.ceil(wordCount / 200)} min read`,
        image_url: '', created_at: '', updated_at: '', published_at: null,
      });
      setEditorTab('preview');
      setShowAiDialog(false);
      toast({ title: 'Article generated!', description: `${wordCount} words · Review in the editor before publishing.` });
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'Generation failed. The AI service might be temporarily unavailable.');
    } finally { setAiLoading(false); }
  };

  // ─── Render ─────────────────────────────────────────────
  return (
    <GlassCard variant="elevated" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5" /> Blog Manager
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {posts.length} posts · {posts.filter(p => p.status === 'published').length} published · All posts created via AI
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="h-4 w-4 mr-1" /> Refresh</Button>
          <Button size="sm" onClick={startAiFlow} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0">
            <Wand2 className="h-4 w-4 mr-1" /> AI Generate Post
          </Button>
        </div>
      </div>

      {/* ─── AI Dialog ────────────────────────────────────── */}
      <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl"><Wand2 className="h-5 w-5 text-purple-600" /> AI Blog Generator</DialogTitle>
            <DialogDescription>
              {aiStep === 'ideas' ? 'Step 1: Get smart topic suggestions based on your content gaps.' : 'Step 2: AI writes a complete SEO-optimized article.'}
            </DialogDescription>
          </DialogHeader>

          {aiStep === 'ideas' && (
            <div className="space-y-4">
              {aiIdeas.length === 0 && !aiLoading && !aiError && (
                <div className="text-center py-8">
                  <Lightbulb className="h-14 w-14 text-yellow-500 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-1">AI analyzes your existing {posts.length} posts</p>
                  <p className="text-sm text-muted-foreground mb-6">and suggests topics that fill content gaps for better SEO coverage.</p>
                  <Button onClick={generateIdeas} disabled={aiLoading} size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0">
                    {aiLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    Generate Topic Ideas
                  </Button>
                </div>
              )}

              {aiLoading && aiStep === 'ideas' && (
                <div className="text-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
                  <p className="text-sm text-muted-foreground mt-3">Analyzing your blog content and keyword gaps...</p>
                </div>
              )}

              {aiError && (
                <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">{aiError}</div>
              )}

              {aiIdeas.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Pick a topic or type your own:</p>
                  {aiIdeas.map((idea, i) => (
                    <button key={i} className={`w-full text-left p-3 rounded-lg border transition-all text-foreground ${aiTopic === idea ? 'border-purple-500 bg-purple-50 dark:bg-purple-950 ring-1 ring-purple-500' : 'hover:border-purple-300 hover:bg-muted/50'}`}
                      onClick={() => setAiTopic(idea)}>
                      <span className="text-sm font-medium">{idea}</span>
                    </button>
                  ))}
                  <div className="pt-3">
                    <Label className="text-xs">Or type your own topic:</Label>
                    <Input value={aiTopic} onChange={e => setAiTopic(e.target.value)}
                      placeholder="e.g., How to Optimize Your LinkedIn Profile for Recruiters" className="mt-1" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={() => { setAiIdeas([]); setAiTopic(''); setAiError(''); }}>
                      Regenerate Ideas
                    </Button>
                    <Button onClick={() => setAiStep('generate')} disabled={!aiTopic.trim()}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0">
                      Continue to Generate →
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {aiStep === 'generate' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Generating article for:</p>
                <p className="text-lg font-semibold text-foreground">{aiTopic}</p>
                <button className="text-xs text-primary hover:underline mt-1" onClick={() => setAiStep('ideas')}>← Change topic</button>
              </div>

              {aiError && <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">{aiError}</div>}

              <div className="p-4 rounded-lg border bg-muted/20">
                <p className="text-sm font-medium mb-2">What the AI will generate:</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>SEO-optimized meta description</li>
                  <li>4-6 sections with H2/H3 headings</li>
                  <li>Internal links to FlowCreate pages</li>
                  <li>FAQ section with 3-5 Q&A pairs</li>
                  <li>Call-to-action for the resume builder</li>
                  <li>800-1200 words, proper HTML formatting</li>
                </ul>
              </div>

              <Button onClick={generateArticle} disabled={aiLoading} size="lg" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 h-12">
                {aiLoading ? (
                  <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Writing article... (~20-30 seconds)</>
                ) : (
                  <><Sparkles className="h-5 w-5 mr-2" /> Generate Full Article</>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── List View ───────────────────────────────────── */}
      {!editingPost && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search posts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
            <select className="rounded-md border px-3 py-1.5 text-sm bg-background" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option><option value="published">Published</option><option value="draft">Draft</option>
            </select>
            <select className="rounded-md border px-3 py-1.5 text-sm bg-background" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {isLoading ? <p className="text-muted-foreground text-center py-8">Loading posts...</p> :
           filtered.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">No posts yet.</p>
              <p className="text-sm text-muted-foreground mb-4">All blog content is created via AI. Click below to generate your first post.</p>
              <Button onClick={startAiFlow} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0">
                <Wand2 className="h-4 w-4 mr-1" /> Generate First Post
              </Button>
            </div>
          ) : (
          <div className="space-y-1">
            {filtered.map(post => (
              <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm truncate">{post.title}</span>
                    <Badge variant="outline" className={post.status === 'published' ? 'text-green-600 bg-green-50 dark:bg-green-950 text-xs' : 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950 text-xs'}>{post.status}</Badge>
                    <span className="text-xs text-muted-foreground">{post.category}</span>
                    <span className="text-xs text-muted-foreground">{post.read_time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{post.excerpt}</p>
                </div>
                <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => { setEditingPost(post); setEditorTab('edit'); }}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title={post.status === 'published' ? 'Unpublish' : 'Publish'} onClick={() => toggleStatus(post)}><Eye className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Delete" onClick={() => deletePost(post.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>)}
        </>
      )}

      {/* ─── Editor View (shown after AI generates or when editing) ─── */}
      {editingPost && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-lg flex items-center gap-2">
                {editingPost.id ? 'Edit Post' : <><Sparkles className="h-4 w-4 text-purple-600" /> Review AI-Generated Draft</>}
              </h4>
              {!editingPost.id && <p className="text-xs text-muted-foreground mt-0.5">Review the AI content below. Edit anything, then publish.</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { if (!editingPost.id && !confirm('Discard this AI-generated draft?')) return; setEditingPost(null); }}>Cancel</Button>
              <Button size="sm" variant="outline" onClick={() => savePost('draft')} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Save Draft
              </Button>
              <Button size="sm" onClick={() => savePost('published')} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white border-0">
                <Send className="h-4 w-4 mr-1" /> Publish
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><Label className="text-xs">Title</Label>
              <Input value={editingPost.title} onChange={e => setEditingPost({ ...editingPost, title: e.target.value, slug: slugify(e.target.value) })} /></div>
            <div><Label className="text-xs">Slug</Label>
              <Input value={editingPost.slug} onChange={e => setEditingPost({ ...editingPost, slug: e.target.value })} /></div>
            <div><Label className="text-xs">Category</Label>
              <select className="w-full rounded-md border px-3 py-1.5 text-sm bg-background" value={editingPost.category}
                onChange={e => setEditingPost({ ...editingPost, category: e.target.value })}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><Label className="text-xs">Read Time</Label>
              <Input value={editingPost.read_time} onChange={e => setEditingPost({ ...editingPost, read_time: e.target.value })} /></div>
          </div>
          <div><Label className="text-xs">SEO Description (meta tag)</Label>
            <Textarea value={editingPost.description} onChange={e => setEditingPost({ ...editingPost, description: e.target.value })} rows={2} /></div>
          <div><Label className="text-xs">Excerpt (blog card preview)</Label>
            <Textarea value={editingPost.excerpt} onChange={e => setEditingPost({ ...editingPost, excerpt: e.target.value })} rows={2} /></div>
          <div><Label className="text-xs">Keywords (comma-separated)</Label>
            <Input value={(editingPost.keywords || []).join(', ')}
              onChange={e => setEditingPost({ ...editingPost, keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) })} /></div>

          <Tabs value={editorTab} onValueChange={setEditorTab}>
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="edit">Edit HTML</TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="mt-3">
              <div className="border rounded-lg p-6 prose prose-lg dark:prose-invert max-w-none min-h-[400px]"
                dangerouslySetInnerHTML={{ __html: editingPost.content || '<p class="text-muted-foreground">No content yet.</p>' }} />
            </TabsContent>
            <TabsContent value="edit" className="mt-3 space-y-2">
              <div className="flex flex-wrap gap-1 p-2 border rounded-t-lg bg-muted/30">
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Bold" onClick={() => execCmd('bold')}><Bold className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Italic" onClick={() => execCmd('italic')}><Italic className="h-3.5 w-3.5" /></Button>
                <span className="w-px bg-border mx-0.5" />
                <Button variant="ghost" size="icon" className="h-7 w-7 font-bold text-xs text-foreground" title="H2" onClick={() => execCmd('formatBlock', 'h2')}>H2</Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 font-bold text-xs text-foreground" title="H3" onClick={() => execCmd('formatBlock', 'h3')}>H3</Button>
                <span className="w-px bg-border mx-0.5" />
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Bullet List" onClick={() => execCmd('insertUnorderedList')}><List className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Numbered List" onClick={() => execCmd('insertOrderedList')}><ListOrdered className="h-3.5 w-3.5" /></Button>
                <span className="w-px bg-border mx-0.5" />
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Link" onClick={insertLink}><Link2 className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Image" onClick={insertImage}><Image className="h-3.5 w-3.5" /></Button>
                <span className="w-px bg-border mx-0.5" />
                <Button variant="ghost" size="sm" className="h-7 text-xs text-purple-600" title="AI Rewrite Selection"
                  onClick={async () => {
                    editorRef.current?.focus();
                    const sel = window.getSelection()?.toString()?.trim();
                    if (!sel) { toast({ title: 'Select text to rewrite', variant: 'destructive' }); return; }
                    try {
                      const improved = await callGemini(`Improve this text for a professional blog article. Fix grammar, make it more engaging, keep the same meaning. Return ONLY the improved text:\n\n"${sel}"`);
                      document.execCommand('insertHTML', false, improved);
                      syncContent();
                    } catch { toast({ title: 'AI rewrite failed', variant: 'destructive' }); }
                  }}>
                  <Sparkles className="h-3 w-3 mr-1" /> AI Rewrite
                </Button>
              </div>
              <div ref={editorRef} contentEditable onInput={syncContent}
                className="min-h-[400px] border rounded-b-lg p-4 prose prose-sm dark:prose-invert max-w-none focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </GlassCard>
  );
}
