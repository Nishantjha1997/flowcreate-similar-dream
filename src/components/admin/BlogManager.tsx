import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, Edit, Trash2, Eye, Search, RefreshCw, Sparkles,
  Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered,
  Link2, Image, Send, Loader2, BookOpen, Lightbulb
} from 'lucide-react';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  content: string;
  category: string;
  status: 'draft' | 'published';
  keywords: string[];
  author: string;
  read_time: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
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
  const [aiTopic, setAiTopic] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: posts = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
    retry: false,
  });

  const filtered = posts.filter((p) => {
    const mStatus = statusFilter === 'all' || p.status === statusFilter;
    const mCat = categoryFilter === 'all' || p.category === categoryFilter;
    const mSearch = !searchTerm || p.title.toLowerCase().includes(searchTerm.toLowerCase());
    return mStatus && mCat && mSearch;
  });

  // ─── Editor toolbar commands ──────────────────────────────
  const execCmd = useCallback((cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
  }, []);

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) execCmd('createLink', url);
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) execCmd('insertImage', url);
  };

  // Sync contenteditable → state
  const syncContent = () => {
    if (editorRef.current && editingPost) {
      setEditingPost({ ...editingPost, content: editorRef.current.innerHTML });
    }
  };

  // Load content into editor when editingPost changes
  useEffect(() => {
    if (editorRef.current && editingPost) {
      editorRef.current.innerHTML = editingPost.content || '';
    }
  }, [editingPost?.id, isCreating]);

  // ─── Save ─────────────────────────────────────────────────
  const savePost = async () => {
    if (!editingPost) return;
    const post = editingPost;
    if (!post.title?.trim()) { toast({ title: 'Title required', variant: 'destructive' }); return; }

    syncContent();
    const slug = post.slug || slugify(post.title);
    const payload = {
      title: post.title,
      slug,
      excerpt: post.excerpt || '',
      description: post.description || '',
      content: post.content || '',
      category: post.category || 'Resume Tips',
      status: post.status || 'draft',
      keywords: post.keywords || [],
      author: post.author || 'FlowCreate Team',
      read_time: post.read_time || '5 min read',
      image_url: post.image_url || '',
      published_at: post.status === 'published' ? new Date().toISOString() : post.published_at,
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
      setEditingPost(null);
      setIsCreating(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (id: string) => {
    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Post deleted' });
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    } catch (err: unknown) {
      toast({ title: 'Delete failed', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  const toggleStatus = async (post: BlogPost) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    const { error } = await supabase.from('blog_posts').update({
      status: newStatus,
      published_at: newStatus === 'published' ? new Date().toISOString() : post.published_at,
    }).eq('id', post.id);
    if (!error) {
      toast({ title: newStatus === 'published' ? 'Published!' : 'Unpublished' });
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    }
  };

  // ─── AI ───────────────────────────────────────────────────
  const generateTopicIdeas = async () => {
    setAiGenerating(true);
    try {
      const existingTitles = posts.map(p => p.title).join(', ');
      const prompt = `You are a blog strategist for a resume builder website. Based on these existing article titles: [${existingTitles}], suggest 5 NEW blog topic ideas that fill content gaps. Each idea should be a compelling title. Return exactly 5 titles, one per line. Do not include numbers or bullets.`;
      
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      const res = await fetch('https://tkhnxiqvghvejdulvmmx.functions.supabase.co/gemini-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ prompt }),
      });
      const json = await res.json();
      if (json.suggestion) {
        setAiSuggestions(json.suggestion.split('\n').filter((s: string) => s.trim()));
      } else if (json.error) {
        toast({ title: 'AI Error', description: json.error, variant: 'destructive' });
      }
    } catch (err: unknown) {
      toast({ title: 'Failed to generate ideas', variant: 'destructive' });
    } finally {
      setAiGenerating(false);
    }
  };

  const generateArticle = async () => {
    if (!aiTopic.trim()) { toast({ title: 'Enter a topic first' }); return; }
    setAiGenerating(true);
    try {
      const prompt = `You are an expert SEO content strategist and career coach writing for FlowCreate, a free online resume builder.

Write a comprehensive, SEO-optimized blog article about "${aiTopic}".

CRITICAL SEO REQUIREMENTS:
1. Include a "Frequently Asked Questions" (FAQ) section at the end with 3-5 questions and detailed answers. Format FAQ as: <h2>Frequently Asked Questions</h2> followed by <h3>Q: question?</h3><p>A: answer</p> for each.
2. Naturally link to these FlowCreate pages where relevant: <a href="/resume-builder">free resume builder</a>, <a href="/templates">resume templates</a>, <a href="/pricing">pricing</a>, <a href="/blog">career blog</a>, <a href="/help">help center</a>. Use descriptive anchor text with target keywords.
3. Structure the article for Google featured snippets: use clear H2/H3 headings, include a bulleted summary or numbered list that could appear as a snippet.
4. Target the primary keyword naturally in the first 100 words, in at least one H2, and in the conclusion.
5. Write a compelling meta description (150-160 chars) at the very top wrapped in a <!-- meta-desc: ... --> comment.
6. Use EEAT signals: mention "according to industry data", "recruiters recommend", "studies show" where appropriate to demonstrate expertise.
7. Include a clear call-to-action at the end linking to FlowCreate.

FORMATTING:
- Use only these HTML tags: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <a href="...">, <em>
- No <h1> (the page template adds the title)
- Length: 800-1200 words
- Do NOT wrap in markdown code blocks. Return raw HTML only.
- Separate sections clearly with <h2> headings.
- Make the article helpful, actionable, and genuinely useful for job seekers.`;

      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      const res = await fetch('https://tkhnxiqvghvejdulvmmx.functions.supabase.co/gemini-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ prompt }),
      });
      const json = await res.json();
      if (json.suggestion) {
        let html = json.suggestion.replace(/```html|```/g, '').trim();
        // Extract meta description from <!-- meta-desc: ... --> comment
        const metaMatch = html.match(/<!--\s*meta-desc:\s*(.*?)\s*-->/i);
        const metaDesc = metaMatch ? metaMatch[1] : '';
        html = html.replace(/<!--\s*meta-desc:.*?-->/gi, '').trim();
        const title = aiTopic;
        const slug = slugify(title);
        const excerpt = html.replace(/<[^>]*>/g, '').slice(0, 160).replace(/\s+/g, ' ').trim() + '...';
        const wordCount = html.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
        setEditingPost({
          ...defaultPost,
          title, slug, excerpt,
          description: metaDesc || excerpt,
          content: html,
          keywords: [],
          read_time: `${Math.ceil(wordCount / 200)} min read`,
        });
        setIsCreating(true);
        setEditorTab('edit');
        toast({ title: 'Article generated! Review and publish.' });
      } else {
        toast({ title: 'AI Error', description: json.error || 'No response', variant: 'destructive' });
      }
    } catch (err: unknown) {
      toast({ title: 'Generation failed', variant: 'destructive' });
    } finally {
      setAiGenerating(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────
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
          <Button size="sm" onClick={() => { setEditingPost({ ...defaultPost }); setIsCreating(true); }}>
            <Plus className="h-4 w-4 mr-1" /> New Post
          </Button>
        </div>
      </div>

      {/* ─── List View ─────────────────────────────────────── */}
      {!showEditor && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            <Input placeholder="Search posts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="max-w-xs" icon={<Search className="h-4 w-4" />} />
            <select className="rounded-md border px-3 py-1.5 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option><option value="published">Published</option><option value="draft">Draft</option>
            </select>
            <select className="rounded-md border px-3 py-1.5 text-sm" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {isLoading ? <p className="text-muted-foreground text-center py-8">Loading...</p> :
           filtered.length === 0 ? <p className="text-muted-foreground text-center py-8">No posts found.</p> :
          <div className="space-y-1">
            {filtered.map(post => (
              <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm truncate">{post.title}</span>
                    <Badge variant="outline" className={post.status === 'published' ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'}>
                      {post.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{post.category}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{post.excerpt}</p>
                </div>
                <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit"
                    onClick={() => { setEditingPost(post); setIsCreating(false); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                    onClick={() => toggleStatus(post)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Delete"
                    onClick={() => { if (confirm('Delete this post?')) deletePost(post.id); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>}
        </>
      )}

      {/* ─── Editor View ────────────────────────────────────── */}
      {showEditor && editingPost && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">{isCreating ? 'New Post' : 'Edit Post'}</h4>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setEditingPost(null); setIsCreating(false); }}>Cancel</Button>
              <Button size="sm" onClick={() => { syncContent(); savePost(); }} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                {editingPost.status === 'published' ? 'Update' : 'Save Draft'}
              </Button>
              {editingPost.status !== 'published' && (
                <Button size="sm" variant="default" onClick={() => {
                  syncContent();
                  setEditingPost({ ...editingPost, status: 'published' });
                  setTimeout(() => savePost(), 50);
                }} disabled={saving}>
                  <Send className="h-4 w-4 mr-1" /> Publish
                </Button>
              )}
            </div>
          </div>

          {/* SEO Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Title</Label>
              <Input value={editingPost.title} onChange={e => {
                const title = e.target.value;
                setEditingPost({ ...editingPost, title, slug: slugify(title) });
              }} placeholder="Post title" />
            </div>
            <div>
              <Label className="text-xs">Slug</Label>
              <Input value={editingPost.slug} onChange={e => setEditingPost({ ...editingPost, slug: e.target.value })} placeholder="url-slug" />
            </div>
            <div>
              <Label className="text-xs">Category</Label>
              <select className="w-full rounded-md border px-3 py-1.5 text-sm" value={editingPost.category}
                onChange={e => setEditingPost({ ...editingPost, category: e.target.value })}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Read Time</Label>
              <Input value={editingPost.read_time} onChange={e => setEditingPost({ ...editingPost, read_time: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <Label className="text-xs">SEO Description (meta description)</Label>
              <Textarea value={editingPost.description} onChange={e => setEditingPost({ ...editingPost, description: e.target.value })}
                rows={2} placeholder="160-character meta description for search engines" />
            </div>
            <div>
              <Label className="text-xs">Excerpt (shown in blog cards)</Label>
              <Textarea value={editingPost.excerpt} onChange={e => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                rows={2} placeholder="Short excerpt for blog listing cards" />
            </div>
            <div>
              <Label className="text-xs">Keywords (comma-separated)</Label>
              <Input value={(editingPost.keywords || []).join(', ')}
                onChange={e => setEditingPost({ ...editingPost, keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) })}
                placeholder="resume tips, job search, career advice" />
            </div>
          </div>

          {/* Tabs: Edit | Preview | AI Generate */}
          <Tabs value={editorTab} onValueChange={setEditorTab}>
            <TabsList>
              <TabsTrigger value="edit">Edit Content</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="ai"><Sparkles className="h-3 w-3 mr-1" /> AI Generate</TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="mt-3 space-y-2">
              {/* Toolbar */}
              <div className="flex flex-wrap gap-1 p-2 border rounded-t-lg bg-muted/30">
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Bold" onClick={() => execCmd('bold')}><Bold className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Italic" onClick={() => execCmd('italic')}><Italic className="h-3.5 w-3.5" /></Button>
                <span className="w-px bg-border mx-0.5" />
                <Button variant="ghost" size="icon" className="h-7 w-7 font-bold text-xs" title="Heading 1" onClick={() => execCmd('formatBlock', 'h2')}>H2</Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 font-bold text-xs" title="Heading 2" onClick={() => execCmd('formatBlock', 'h3')}>H3</Button>
                <span className="w-px bg-border mx-0.5" />
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Bullet List" onClick={() => execCmd('insertUnorderedList')}><List className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Numbered List" onClick={() => execCmd('insertOrderedList')}><ListOrdered className="h-3.5 w-3.5" /></Button>
                <span className="w-px bg-border mx-0.5" />
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Insert Link" onClick={insertLink}><Link2 className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Insert Image" onClick={insertImage}><Image className="h-3.5 w-3.5" /></Button>
              </div>
              {/* Contenteditable */}
              <div
                ref={editorRef}
                contentEditable
                onInput={syncContent}
                className="min-h-[400px] border rounded-b-lg p-4 prose prose-sm max-w-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Start writing..."
              />
            </TabsContent>

            <TabsContent value="preview" className="mt-3">
              <div className="border rounded-lg p-6 prose prose-lg max-w-none min-h-[400px]"
                dangerouslySetInnerHTML={{ __html: editingPost.content || '<p class="text-muted-foreground">Nothing to preview yet.</p>' }} />
            </TabsContent>

            <TabsContent value="ai" className="mt-3 space-y-4">
              <div className="p-4 border rounded-lg bg-muted/20">
                <h4 className="font-semibold flex items-center gap-2 mb-2"><Lightbulb className="h-4 w-4 text-yellow-500" /> AI Topic Ideas</h4>
                <p className="text-sm text-muted-foreground mb-3">Get new blog topic ideas based on what you've already covered.</p>
                <Button variant="outline" size="sm" onClick={generateTopicIdeas} disabled={aiGenerating}>
                  {aiGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Sparkles className="h-4 w-4 mr-1" />}
                  Generate Topic Ideas
                </Button>
                {aiSuggestions.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {aiSuggestions.map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                        <span className="text-sm">{s}</span>
                        <Button variant="ghost" size="sm" className="text-xs"
                          onClick={() => { setAiTopic(s); }}>
                          Use This
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold flex items-center gap-2 mb-3"><Sparkles className="h-4 w-4 text-primary" /> Generate Full Article</h4>
                <Label className="text-xs">Article Topic</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={aiTopic} onChange={e => setAiTopic(e.target.value)}
                    placeholder="e.g., How to Negotiate Salary After a Job Offer" />
                  <Button onClick={generateArticle} disabled={aiGenerating || !aiTopic.trim()}>
                    {aiGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Sparkles className="h-4 w-4 mr-1" />}
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  AI will write a full article with proper HTML formatting. Generated content appears in the editor for review before publishing.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </GlassCard>
  );
}
