import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Clock, Calendar, Share2, Loader2 } from 'lucide-react';
import { ScrollReveal } from '@/hooks/useScrollAnimation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface BlogPost {
  id: string; slug: string; title: string; excerpt: string;
  description: string; content: string; category: string;
  read_time: string; published_at: string; created_at: string; keywords: string[];
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      if (error) throw error;
      return data as BlogPost;
    },
    enabled: !!slug,
    retry: false,
  });

  const { data: relatedPosts = [] } = useQuery({
    queryKey: ['related-posts', post?.category, slug],
    queryFn: async () => {
      if (!post) return [];
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, slug, title, category, read_time')
        .eq('status', 'published')
        .eq('category', post.category)
        .neq('slug', slug)
        .order('published_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
    enabled: !!post,
    retry: false,
  });

  usePageMeta({
    title: post ? `${post.title} | FlowCreate Blog` : 'Blog Post',
    description: post?.description || 'Resume tips and career advice from FlowCreate.',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background"><Header />
        <main className="py-20"><div className="container mx-auto px-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-4">Loading article...</p>
        </div></main>
        <Footer />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="min-h-screen bg-background"><Header />
        <main className="py-20"><div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist or has been moved.</p>
          <Link to="/blog"><Button size="lg">Browse All Articles <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        </div></main>
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
            {/* Back link */}
            <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-8">
              <ArrowLeft className="h-4 w-4" /> Back to Blog
            </Link>

            <ScrollReveal>
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {post.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {post.readTime}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
                {post.title}
              </h1>
              <p className="text-lg text-muted-foreground">{post.excerpt}</p>
            </div>
            </ScrollReveal>

            {/* Content */}
            <ScrollReveal delay={50}>
            <article
              className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground/85 prose-a:text-primary prose-strong:text-foreground prose-li:text-foreground/85 mb-16"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            </ScrollReveal>

            {/* Share */}
            <div className="flex items-center gap-3 py-6 border-t mb-12">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Share2 className="h-4 w-4" /> Share this article:
              </span>
              <Button variant="outline" size="sm" onClick={() => navigator.clipboard?.writeText(window.location.href)}>
                Copy Link
              </Button>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <ScrollReveal delay={100}>
              <div className="mb-16">
                <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((rp) => (
                    <Link key={rp.slug} to={`/blog/${rp.slug}`} className="group block">
                      <div className="rounded-xl border p-5 hover:border-primary hover:shadow-sm transition-all h-full">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          {rp.category}
                        </span>
                        <h3 className="font-semibold mt-2 mb-1 group-hover:text-primary transition-colors line-clamp-2">
                          {rp.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">{rp.readTime}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              </ScrollReveal>
            )}

            {/* CTA */}
            <ScrollReveal delay={150}>
            <div className="bg-[hsl(var(--surface-dark))] rounded-3xl p-10 md:p-14 text-center text-white">
              <h2 className="text-2xl font-bold mb-4">Put These Tips Into Practice</h2>
              <p className="text-white/70 mb-8 max-w-md mx-auto">
                Build a professional resume that puts these strategies to work. Free, no sign-up required until download.
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
