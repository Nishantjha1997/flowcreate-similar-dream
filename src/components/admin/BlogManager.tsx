import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase, SUPABASE_FUNCTIONS_URL } from '@/integrations/supabase/client';
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
  Plus, Edit, Trash2, Eye, Search, RefreshCw, Sparkles,
  Bold, Italic, List, ListOrdered,
  Link2, Image, Send, Loader2, BookOpen, Lightbulb, FileText, Wand2
} from 'lucide-react';

interface BlogPost {
  id: string; slug: string; title: string; excerpt: string; description: string;
  content: string; category: string; status: 'draft' | 'published';
  keywords: string[]; author: string; read_time: string; image_url: string;
  created_at: string; updated_at: string; published_at: string | null;
}

const categories = ['Resume Tips', 'Career Advice', 'Job Search', 'Interview Tips', 'Industry Insights'];
const defaultPost: Partial<BlogPost> = {
  title: '', slug: '', excerpt: '', description: '', content: '',
  category: 'Resume Tips', status: 'draft', keywords: [],
  author: 'FlowCreate Team', read_time: '5 min read', image_url: '',
};

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function callGemini(prompt: string, maxTokens?: number): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const body: Record<string, unknown> = { prompt };
  if (maxTokens) body.maxTokens = maxTokens;

  const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/gemini-suggest`, {
    method: 'POST', headers, body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  if (data.error) throw new Error(data.error);
  if (!data.suggestion) throw new Error('No suggestion returned from AI');
  return data.suggestion;
}

export function BlogManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const editorRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
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

  const filtered = posts.filter(p => {
    return (statusFilter === 'all' || p.status === statusFilter) &&
      (categoryFilter === 'all' || p.category === categoryFilter) &&
      (!searchTerm || p.title.toLowerCase().includes(searchTerm.toLowerCase()));
  });

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
    if (editorRef.current && editingPost) {
      editorRef.current.innerHTML = editingPost.content || '';
    }
  }, [editingPost?.id, isCreating]);

  // ─── Save ───────────────────────────────────────────────
  const savePost = async (status?: 'draft' | 'published') => {
    if (!editingPost) return;
    syncContent();
    const post = { ...editingPost, content: editorRef.current?.innerHTML || editingPost.content };
    if (!post.title?.trim()) { toast({ title: 'Title required', variant: 'destructive' }); return; }
    const finalStatus = status || post.status || 'draft';

    const payload = {
      title: post.title, slug: post.slug || slugify(post.title),
      excerpt: post.excerpt || '', description: post.description || '',
      content: post.content || '', category: post.category || 'Resume Tips',
      status: finalStatus, keywords: post.keywords || [],
      author: post.author || 'FlowCreate Team', read_time: post.read_time || '5 min read',
      image_url: post.image_url || '',
      published_at: finalStatus === 'published' ? new Date().toISOString() : post.published_at,
      updated_at: new Date().toISOString(),
    };

    setSaving(true);
    try {
      if (post.id) {
        const { error } = await supabase.from('blog_posts').update(payload).eq('id', post.id);
        if (error) throw error;
        toast({ title: 'Post updated' });
      } else {
        const { error } = await supabase.from('blog_posts').insert(payload);
        if (error) throw error;
        toast({ title: 'Post created' });
      }
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      setEditingPost(null); setIsCreating(false);
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Save failed', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return;
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
      toast({ title: 'Failed to update status', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    }
  };

  // ─── AI Flow ────────────────────────────────────────────
  const startAiFlow = () => {
    setShowAiDialog(true);
    setAiStep('ideas');
    setAiIdeas([]);
    setAiTopic('');
    setAiError('');
  };

  const generateIdeas = async () => {
    setAiLoading(true); setAiError('');
    try {
      const titles = posts.map(p => p.title).join('; ');
      const prompt = `You are a blog strategist. Based on these existing articles: [${titles || 'none yet'}], suggest 5 NEW blog topic titles for a resume builder website. Each title should target a specific job-seeker keyword. Return exactly 5 titles, one per line, no numbers or bullets.`;
      const result = await callGemini(prompt);
      setAiIdeas(result.split('\n').map(s => s.replace(/^[\d.\-\s]+/, '').trim()).filter(s => s.length > 5));
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'Failed to generate ideas');
    } finally { setAiLoading(false); }
  };

  const generateArticle = async () => {
    if (!aiTopic.trim()) { setAiError('Enter or select a topic first'); return; }
    setAiLoading(true); setAiError('');
    try {
      const prompt = `You are an expert SEO content writer for FlowCreate, a free online resume builder at flowcreate.com.

Write a comprehensive, fully SEO-optimized blog article titled "${aiTopic}".

REQUIREMENTS:
1. Start with <!-- meta-desc: [compelling 150-160 char meta description with primary keyword] -->
2. Use proper HTML: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <a href="...">
3. Include 4-6 sections with clear H2 headings.
4. End with <h2>Frequently Asked Questions</h2> followed by 3-5 <h3>Q: ...</h3><p>A: ...</p> pairs.
5. Naturally link to these FlowCreate pages: <a href="/resume-builder">free resume builder</a>, <a href="/templates">resume templates</a>, <a href="/pricing">pricing</a>, <a href="/help">help center</a>.
6. Target keywords naturally in first 100 words, H2 headings, and conclusion.
7. Include a compelling CTA at the end.
8. Length: 800-1200 words. Tone: professional, helpful, authoritative.
9. Return raw HTML only — no markdown code blocks.`;

      const htmlRaw = await callGemini(prompt, 4000);
      let html = htmlRaw.replace(/```html|```/g, '').trim();
      const metaMatch = html.match(/<!--\s*meta-desc:\s*(.*?)\s*-->/i);
      const metaDesc = metaMatch ? metaMatch[1].trim() : '';
      html = html.replace(/<!--\s*meta-desc:.*?-->/gi, '').trim();

      const plainText = html.replace(/<[^>]*>/g, '');
      const wordCount = plainText.split(/\s+/).filter(Boolean).length;
      const excerpt = plainText.slice(0, 160).replace(/\s+/g, ' ').trim() + '...';

      setEditingPost({
        ...defaultPost,
        title: aiTopic,
        slug: slugify(aiTopic),
        excerpt,
        description: metaDesc || excerpt,
        content: html,
        keywords: [],
        read_time: `${Math.ceil(wordCount / 200)} min read`,
      });
      setIsCreating(true);
      setEditorTab('edit');
      setShowAiDialog(false);
      toast({ title: 'Article generated! Review and publish.', description: `${wordCount} words · ${Math.ceil(wordCount / 200)} min read` });
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'Generation failed. Try again.');
    } finally { setAiLoading(false); }
  };

  // ─── Render ─────────────────────────────────────────────
  const showEditor = isCreating || !!editingPost;

  return (
    <GlassCard variant="elevated" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5" /> Blog Manager
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {posts.length} posts · {posts.filter(p => p.status === 'published').length} published
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={startAiFlow} className="text-purple-600 border-purple-300 hover:bg-purple-50">
            <Wand2 className="h-4 w-4 mr-1" /> AI Generate
          </Button>
          <Button size="sm" onClick={() => { setEditingPost({ ...defaultPost }); setIsCreating(true); }}>
            <Plus className="h-4 w-4 mr-1" /> New Post
          </Button>
        </div>
      </div>

      {/* ─── AI Dialog ────────────────────────────────────── */}
      <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Wand2 className="h-5 w-5 text-purple-600" /> AI Blog Generator</DialogTitle>
            <DialogDescription>
              {aiStep === 'ideas' ? 'Step 1: Get topic ideas based on your existing content.' : 'Step 2: Generate a full SEO-optimized article.'}
            </DialogDescription>
          </DialogHeader>

          {aiStep === 'ideas' && (
            <div className="space-y-4">
              {aiIdeas.length === 0 && !aiLoading && (
                <div className="text-center py-6">
                  <Lightbulb className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">AI will analyze your existing posts and suggest new topics that fill content gaps.</p>
                  <Button onClick={generateIdeas} disabled={aiLoading} size="lg">
                    {aiLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    Generate Topic Ideas
                  </Button>
                </div>
              )}

              {aiLoading && aiStep === 'ideas' && (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground mt-3">Analyzing your blog content...</p>
                </div>
              )}

              {aiIdeas.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Select a topic or type your own:</p>
                  {aiIdeas.map((idea, i) => (
                    <button key={i} className={`w-full text-left p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all ${aiTopic === idea ? 'border-primary bg-primary/10 ring-1 ring-primary' : ''}`}
                      onClick={() => setAiTopic(idea)}>
                      <span className="text-sm font-medium">{idea}</span>
                    </button>
                  ))}
                  <div className="pt-2">
                    <Label className="text-xs">Or type your own topic:</Label>
                    <Input value={aiTopic} onChange={e => setAiTopic(e.target.value)}
                      placeholder="e.g., How to Optimize Your LinkedIn Profile for Recruiters" className="mt-1" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={() => { setAiIdeas([]); setAiTopic(''); }}>
                      Regenerate Ideas
                    </Button>
                    <Button onClick={() => setAiStep('generate')} disabled={!aiTopic.trim()}>
                      Continue to Generate <ArrowRightIcon />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {aiStep === 'generate' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium">Topic:</p>
                <p className="text-lg font-semibold">{aiTopic}</p>
                <button className="text-xs text-primary mt-1" onClick={() => setAiStep('ideas')}>← Change topic</button>
              </div>

              {aiError && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                  {aiError}
                </div>
              )}

              <Button onClick={generateArticle} disabled={aiLoading} size="lg" className="w-full">
                {aiLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating article... (takes ~15-30 seconds)</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" /> Generate Full Article</>
                )}
              </Button>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>The AI will generate:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>SEO meta description</li>
                  <li>4-6 sections with proper headings</li>
                  <li>Internal links to FlowCreate pages</li>
                  <li>FAQ section at the end</li>
                  <li>Call-to-action for the resume builder</li>
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── List View ───────────────────────────────────── */}
      {!showEditor && (
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

          {isLoading ? <p className="text-muted-foreground text-center py-8">Loading...</p> :
           filtered.length === 0 ? <p className="text-muted-foreground text-center py-8">No posts found.</p> :
          <div className="space-y-1">
            {filtered.map(post => (
              <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm truncate">{post.title}</span>
                    <Badge variant="outline" className={post.status === 'published' ? 'text-green-600 bg-green-50 text-xs' : 'text-yellow-600 bg-yellow-50 text-xs'}>{post.status}</Badge>
                    <span className="text-xs text-muted-foreground">{post.category}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{post.excerpt}</p>
                </div>
                <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit"
                    onClick={() => { setEditingPost(post); setIsCreating(false); }}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                    onClick={() => toggleStatus(post)}><Eye className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Delete"
                    onClick={() => deletePost(post.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>}
        </>
      )}

      {/* ─── Editor View ──────────────────────────────────── */}
      {showEditor && editingPost && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">{isCreating ? 'New Post' : 'Edit Post'}</h4>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setEditingPost(null); setIsCreating(false); }}>Cancel</Button>
              <Button size="sm" variant="outline" onClick={() => savePost('draft')} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Save Draft
              </Button>
              <Button size="sm" onClick={() => savePost('published')} disabled={saving}>
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
          <div><Label className="text-xs">SEO Description</Label>
            <Textarea value={editingPost.description} onChange={e => setEditingPost({ ...editingPost, description: e.target.value })} rows={2} /></div>
          <div><Label className="text-xs">Excerpt</Label>
            <Textarea value={editingPost.excerpt} onChange={e => setEditingPost({ ...editingPost, excerpt: e.target.value })} rows={2} /></div>
          <div><Label className="text-xs">Keywords (comma-separated)</Label>
            <Input value={(editingPost.keywords || []).join(', ')}
              onChange={e => setEditingPost({ ...editingPost, keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) })} /></div>

          <Tabs value={editorTab} onValueChange={setEditorTab}>
            <TabsList>
              <TabsTrigger value="edit">Edit Content</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="mt-3 space-y-2">
              <div className="flex flex-wrap gap-1 p-2 border rounded-t-lg bg-muted/30">
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Bold" onClick={() => execCmd('bold')}><Bold className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Italic" onClick={() => execCmd('italic')}><Italic className="h-3.5 w-3.5" /></Button>
                <span className="w-px bg-border mx-0.5" />
                <Button variant="ghost" size="icon" className="h-7 w-7 font-bold text-xs" title="H2" onClick={() => execCmd('formatBlock', 'h2')}>H2</Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 font-bold text-xs" title="H3" onClick={() => execCmd('formatBlock', 'h3')}>H3</Button>
                <span className="w-px bg-border mx-0.5" />
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Bullet List" onClick={() => execCmd('insertUnorderedList')}><List className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Numbered List" onClick={() => execCmd('insertOrderedList')}><ListOrdered className="h-3.5 w-3.5" /></Button>
                <span className="w-px bg-border mx-0.5" />
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Link" onClick={insertLink}><Link2 className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Image" onClick={insertImage}><Image className="h-3.5 w-3.5" /></Button>
                <span className="w-px bg-border mx-0.5" />
                <Button variant="ghost" size="sm" className="h-7 text-xs text-purple-600" title="AI Rewrite"
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
                className="min-h-[400px] border rounded-b-lg p-4 prose prose-sm max-w-none focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </TabsContent>
            <TabsContent value="preview" className="mt-3">
              <div className="border rounded-lg p-6 prose prose-lg max-w-none min-h-[400px]"
                dangerouslySetInnerHTML={{ __html: editingPost.content || '<p class="text-muted-foreground">Nothing to preview yet.</p>' }} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </GlassCard>
  );
}

function ArrowRightIcon() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" /></svg>;
}
