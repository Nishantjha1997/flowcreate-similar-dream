import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Clock, Calendar, Search, Compass, Sparkles, BookOpen, Layers } from 'lucide-react';
import { ScrollReveal } from '@/hooks/useScrollAnimation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { normalizeBrandText } from '@/config/brand';
import { blogPosts as bundledPosts } from '@/data/blogPosts';
import { professions } from '@/data/professions';

interface BlogPostItem {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  read_time?: string;
  readTime?: string;
  created_at?: string;
  published_at?: string;
  date?: string;
}

const topProfessions = professions.slice(0, 8);

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: dbPosts = [] } = useQuery({
    queryKey: ['published-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, slug, title, excerpt, category, read_time, created_at, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (error) throw error;
      return (data as BlogPostItem[]).map((post) => ({
        ...post,
        title: normalizeBrandText(post.title),
        excerpt: normalizeBrandText(post.excerpt),
      }));
    },
    retry: false,
  });

  // Merge DB posts with bundled fallback posts to ensure 100% availability
  const allPosts: BlogPostItem[] = dbPosts.length > 0
    ? dbPosts
    : bundledPosts.map((p) => ({
        id: p.slug,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        category: p.category,
        read_time: p.readTime,
        created_at: p.date,
        published_at: p.date,
      }));

  const categories = ['All', ...Array.from(new Set(allPosts.map((p) => p.category)))];

  usePageMeta({
    title: 'Resume Tips & Career Advice Blog | MakeCV',
    description: 'Expert resume writing tips, career advice, ATS optimization guides, and job search strategies. Learn how to build better resumes and land more interviews.',
  });

  const filtered = allPosts.filter((post) => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              <BookOpen className="h-3.5 w-3.5" /> MakeCV Editorial & Career Insights
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
              Resume Tips & Career Advice
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              Expert guides to help you master ATS parsing, write quantifiable achievements, ace interviews, and advance your career.
            </p>

            {/* Hub Banner linking to Career Advice */}
            <div className="inline-flex items-center gap-2 p-1.5 pr-4 rounded-full border border-primary/20 bg-primary/5 text-xs text-foreground font-medium hover:bg-primary/10 transition-colors">
              <span className="px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground font-semibold text-[11px]">
                Hub
              </span>
              <span>Looking for structured career search tactics?</span>
              <Link to="/career-advice" className="text-primary font-semibold hover:underline inline-flex items-center gap-0.5">
                Visit Career Advice <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
          </ScrollReveal>

          {/* Category Tabs + Search */}
          <div className="max-w-5xl mx-auto mb-10">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="rounded-full text-xs"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Blog Grid */}
          <div className="max-w-5xl mx-auto mb-20">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg mb-4">No articles found matching your criteria.</p>
                <Button variant="outline" onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((post, i) => (
                  <ScrollReveal key={post.slug} delay={i * 50}>
                  <Link to={`/blog/${post.slug}`} className="group block h-full">
                    <div className="rounded-2xl border border-border/60 bg-card hover:border-primary hover:shadow-md transition-all overflow-hidden h-full flex flex-col justify-between p-6">
                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {post.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {post.read_time || post.readTime || '5 min read'}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2 text-foreground">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                          {post.excerpt}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/40">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.published_at || post.created_at || post.date || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-primary font-medium group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                          Read <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>

          {/* Quick Cross-Link: Career Advice & Profession Templates */}
          <ScrollReveal delay={150}>
          <div className="max-w-5xl mx-auto mb-20 grid md:grid-cols-2 gap-6">
            {/* Career Advice Spotlight */}
            <div className="rounded-3xl border border-border/70 p-8 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4">
                  <Compass className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Career Advice Hub</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Explore comprehensive career strategies covering interview prep, STAR framework answers, salary negotiations, and industry pivots.
                </p>
              </div>
              <Link to="/career-advice">
                <Button variant="outline" className="w-full sm:w-auto text-xs font-semibold">
                  Explore Career Advice <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            {/* Profession Templates Spotlight */}
            <div className="rounded-3xl border border-border/70 p-8 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10 flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Templates by Profession</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Match your background with 33+ ATS-optimized resume layouts designed specifically for engineering, product, finance, and nursing roles.
                </p>
              </div>
              <Link to="/templates">
                <Button variant="outline" className="w-full sm:w-auto text-xs font-semibold">
                  Browse 30+ Templates <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
          </ScrollReveal>

          {/* Profession Link Pills */}
          <ScrollReveal delay={200}>
          <div className="max-w-5xl mx-auto mb-20 rounded-2xl border border-border/50 p-6 bg-muted/20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 text-center">
              Popular Role-Specific Resume Guides & Templates
            </h4>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {topProfessions.map((p) => (
                <Link
                  key={p.slug}
                  to={`/resume-template/${p.slug}`}
                  className="px-3 py-1.5 rounded-full border border-border/60 bg-background text-xs font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  {p.title.replace(' Resume Template', '')}
                </Link>
              ))}
            </div>
          </div>
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal delay={250}>
          <div className="max-w-4xl mx-auto bg-[hsl(var(--surface-dark))] rounded-3xl p-10 md:p-14 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Apply What You Learned?</h2>
            <p className="text-white/70 mb-8 max-w-md mx-auto text-sm sm:text-base">
              Build a professional, ATS-friendly resume in minutes. Free with instant high-resolution PDF download.
            </p>
            <Link to="/resume-builder">
              <Button size="lg" variant="secondary" className="rounded-full px-8 h-12">
                Build Your Free Resume <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          </ScrollReveal>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
