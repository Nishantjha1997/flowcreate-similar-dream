import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Clock, Calendar, Share2, Loader2, Compass, Layers } from 'lucide-react';
import { ScrollReveal } from '@/hooks/useScrollAnimation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { SITE_URL, absoluteUrl } from '@/lib/seo';
import { normalizeBrandText } from '@/config/brand';
import { toast } from 'sonner';
import { sanitizeHtml } from '@/utils/sanitizeHtml';
import { blogPosts as bundledPosts } from '@/data/blogPosts';
import { professions } from '@/data/professions';

interface BlogPostData {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  content: string;
  category: string;
  read_time?: string;
  readTime?: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  keywords?: string[];
  author?: string;
  image_url?: string;
  imageUrl?: string;
}

const topProfessions = professions.slice(0, 6);

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  const fallbackPost = bundledPosts.find((p) => p.slug === slug);

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .single();
        if (error) throw error;
        const raw = data as BlogPostData;
        return {
          ...raw,
          title: normalizeBrandText(raw.title),
          excerpt: normalizeBrandText(raw.excerpt),
          description: normalizeBrandText(raw.description),
          content: normalizeBrandText(raw.content),
          author: normalizeBrandText(raw.author || 'MakeCV Team'),
        };
      } catch (err) {
        if (fallbackPost) {
          return {
            slug: fallbackPost.slug,
            title: normalizeBrandText(fallbackPost.title),
            excerpt: normalizeBrandText(fallbackPost.excerpt),
            description: normalizeBrandText(fallbackPost.description),
            content: normalizeBrandText(fallbackPost.content),
            category: fallbackPost.category,
            read_time: fallbackPost.readTime,
            published_at: fallbackPost.date,
            created_at: fallbackPost.date,
            author: fallbackPost.author || 'MakeCV Team',
          } as BlogPostData;
        }
        throw err;
      }
    },
    enabled: !!slug,
    retry: false,
  });

  const activePost = post || (fallbackPost ? {
    slug: fallbackPost.slug,
    title: normalizeBrandText(fallbackPost.title),
    excerpt: normalizeBrandText(fallbackPost.excerpt),
    description: normalizeBrandText(fallbackPost.description),
    content: normalizeBrandText(fallbackPost.content),
    category: fallbackPost.category,
    read_time: fallbackPost.readTime,
    published_at: fallbackPost.date,
    created_at: fallbackPost.date,
    author: fallbackPost.author || 'MakeCV Team',
  } : null);

  const { data: dbRelatedPosts = [] } = useQuery({
    queryKey: ['related-posts', activePost?.category, slug],
    queryFn: async () => {
      if (!activePost) return [];
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, slug, title, category, read_time')
        .eq('status', 'published')
        .eq('category', activePost.category)
        .neq('slug', slug)
        .order('published_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return (data as Array<{ id: string; slug: string; title: string; category: string; read_time: string }>).map((relatedPost) => ({
        ...relatedPost,
        title: normalizeBrandText(relatedPost.title),
      }));
    },
    enabled: !!activePost,
    retry: false,
  });

  const relatedPosts = dbRelatedPosts.length > 0
    ? dbRelatedPosts
    : bundledPosts
        .filter((p) => p.slug !== slug)
        .slice(0, 3)
        .map((p) => ({ id: p.slug, slug: p.slug, title: p.title, category: p.category, read_time: p.readTime }));

  usePageMeta({
    title: activePost ? `${activePost.title} | MakeCV Blog` : 'Blog Post',
    description: activePost?.description || 'Resume tips and career advice from MakeCV.',
    noindex: !isLoading && !activePost,
    type: 'article',
    image: activePost?.image_url || activePost?.imageUrl || '/og-image.png',
    publishedTime: activePost?.published_at || activePost?.created_at,
    modifiedTime: activePost?.updated_at || activePost?.published_at || activePost?.created_at,
  });

  // Count one view per published post per browser session
  useEffect(() => {
    if (!activePost || !slug) return;
    const key = `blog-viewed:${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    supabase.rpc('increment_blog_view', { post_slug: slug }).catch(() => {
      // Best-effort analytics
    });
  }, [activePost, slug]);

  // Inject JSON-LD structured data for SEO + LLM discoverability
  useEffect(() => {
    if (!activePost) return;
    const faqItems: { question: string; answer: string }[] = [];
    const faqRegex = /<h[23]>\s*(?:Q:?\s*)?(.*?)<\/h[23]>\s*<p>\s*(?:A:?\s*)?([\s\S]*?)<\/p>/gi;
    let match;
    while ((match = faqRegex.exec(activePost.content)) !== null) {
      const q = match[1].replace(/<[^>]*>/g, '').trim();
      const a = match[2].replace(/<[^>]*>/g, '').trim();
      if (q.endsWith('?') || q.toLowerCase().startsWith('how') || q.toLowerCase().startsWith('what') || q.toLowerCase().startsWith('can') || q.toLowerCase().startsWith('is') || q.toLowerCase().startsWith('do')) {
        faqItems.push({ question: q, answer: a.slice(0, 300) });
      }
    }

    const jsonLd: { '@context': string; '@graph': Record<string, unknown>[] } = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BlogPosting',
          headline: activePost.title,
          description: activePost.description,
          datePublished: activePost.published_at || activePost.created_at,
          dateModified: activePost.published_at || activePost.created_at,
          author: { '@type': 'Person', name: activePost.author || 'MakeCV Team' },
          publisher: {
            '@type': 'Organization',
            name: 'MakeCV',
            url: SITE_URL,
            sameAs: ['https://www.linkedin.com/in/nishant-jha-059828104/'],
          },
          mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(`/blog/${activePost.slug}`) },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: absoluteUrl('/blog') },
            { '@type': 'ListItem', position: 3, name: activePost.title },
          ],
        },
      ],
    };

    if (faqItems.length > 0) {
      jsonLd['@graph'].push({
        '@type': 'FAQPage',
        mainEntity: faqItems.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      });
    }

    document.getElementById('seo-structured-data')?.remove();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'seo-structured-data';
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => {
      const el = document.getElementById('seo-structured-data');
      if (el) el.remove();
    };
  }, [activePost]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-20">
          <div className="container mx-auto px-4 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground mt-4">Loading article...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!activePost) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist or has been moved.</p>
            <Link to="/blog">
              <Button size="lg">Browse All Articles <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Breadcrumb / Navigation */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-8">
              <Link to="/blog" className="inline-flex items-center gap-1 hover:text-primary transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" /> Blog
              </Link>
              <span>/</span>
              <Link to="/career-advice" className="hover:text-primary transition-colors">
                Career Advice Hub
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium truncate max-w-xs">{activePost.title}</span>
            </div>

            <ScrollReveal>
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium text-xs">
                  {activePost.category}
                </span>
                <span className="flex items-center gap-1 text-xs">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(activePost.published_at || activePost.created_at || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="flex items-center gap-1 text-xs">
                  <Clock className="h-3.5 w-3.5" /> {activePost.read_time || activePost.readTime || '5 min read'}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
                {activePost.title}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">{activePost.excerpt}</p>
            </div>
            </ScrollReveal>

            {/* Content */}
            <ScrollReveal delay={50}>
            <article
              className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/85 prose-a:text-primary prose-strong:text-foreground prose-li:text-foreground/85 prose-img:rounded-xl prose-img:shadow-md mb-12"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(activePost.content || '') }}
            />
            </ScrollReveal>

            {/* Share */}
            <div className="flex items-center justify-between py-6 border-t border-b border-border/50 mb-12">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Share2 className="h-4 w-4" /> Share this guide with job seekers
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  toast.success('Article link copied to clipboard!');
                }}
                className="text-xs"
              >
                Copy Link
              </Button>
            </div>

            {/* Cross-Link Card: Career Advice Hub */}
            <ScrollReveal delay={75}>
            <div className="mb-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                  <Compass className="h-3.5 w-3.5" /> Next Career Step
                </span>
                <h3 className="font-bold text-foreground text-base">Explore the Career Advice Hub</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Get interview preparation frameworks, salary counter-offer scripts, and career transition guides.
                </p>
              </div>
              <Link to="/career-advice" className="shrink-0 w-full sm:w-auto">
                <Button size="sm" variant="default" className="rounded-full text-xs w-full sm:w-auto">
                  Visit Career Hub <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            </ScrollReveal>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <ScrollReveal delay={100}>
              <div className="mb-16">
                <h2 className="text-2xl font-bold mb-6 text-foreground">Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedPosts.map((rp) => (
                    <Link key={rp.slug} to={`/blog/${rp.slug}`} className="group block">
                      <div className="rounded-xl border border-border/60 p-5 hover:border-primary hover:shadow-sm transition-all h-full bg-card flex flex-col justify-between">
                        <div>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {rp.category}
                          </span>
                          <h3 className="font-semibold mt-2.5 mb-1 group-hover:text-primary transition-colors line-clamp-2 text-sm text-foreground">
                            {rp.title}
                          </h3>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">{rp.read_time}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              </ScrollReveal>
            )}

            {/* Profession Templates Grid */}
            <ScrollReveal delay={125}>
            <div className="mb-16 rounded-2xl border border-border/60 p-6 bg-muted/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-primary" /> Role-Specific Resume Templates
                </h3>
                <Link to="/templates" className="text-xs text-primary font-medium hover:underline">
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {topProfessions.map((p) => (
                  <Link
                    key={p.slug}
                    to={`/resume-template/${p.slug}`}
                    className="p-2.5 rounded-lg border border-border/50 bg-background hover:border-primary hover:text-primary transition-colors text-center text-xs font-medium line-clamp-1"
                  >
                    {p.title.replace(' Resume Template', '')}
                  </Link>
                ))}
              </div>
            </div>
            </ScrollReveal>

            {/* CTA */}
            <ScrollReveal delay={150}>
            <div className="bg-[hsl(var(--surface-dark))] rounded-3xl p-10 md:p-14 text-center text-white">
              <h2 className="text-2xl font-bold mb-4">Put These Tips Into Practice</h2>
              <p className="text-white/70 mb-8 max-w-md mx-auto text-sm sm:text-base">
                Build a professional resume that puts these strategies to work. Free, with instant PDF download.
              </p>
              <Link to="/resume-builder">
                <Button size="lg" variant="secondary" className="rounded-full px-8 h-12">
                  Build Your Resume Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
