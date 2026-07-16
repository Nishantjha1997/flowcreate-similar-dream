import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Clock, Calendar, Search } from 'lucide-react';
import { ScrollReveal } from '@/hooks/useScrollAnimation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface BlogPost {
  id: string; slug: string; title: string; excerpt: string;
  category: string; read_time: string; created_at: string; published_at: string;
}

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: blogPosts = [], isLoading } = useQuery({
    queryKey: ['published-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, slug, title, excerpt, category, read_time, created_at, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
    retry: false,
  });

  const categories = ['All', ...Array.from(new Set(blogPosts.map((p) => p.category)))];

  usePageMeta({
    title: 'Resume Tips & Career Advice Blog',
    description: 'Expert resume writing tips, career advice, and job search strategies. Learn how to build better resumes and land more interviews with FlowCreate.',
  });

  const filtered = blogPosts.filter((post) => {
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
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
              Resume Tips & Career Advice
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Expert guides to help you build better resumes, ace interviews, and advance your career.
            </p>
          </div>
          </ScrollReveal>

          {/* Category Tabs + Search */}
          <div className="max-w-4xl mx-auto mb-10">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="rounded-full"
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
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {/* Blog Grid */}
          <div className="max-w-5xl mx-auto">
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
                  <Link to={`/blog/${post.slug}`} className="group block">
                    <div className="rounded-xl border bg-card hover:border-primary hover:shadow-md transition-all overflow-hidden h-full flex flex-col">
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {post.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {post.readTime}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto pt-4 border-t">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          <ScrollReveal delay={200}>
          <div className="max-w-3xl mx-auto mt-20 bg-[hsl(var(--surface-dark))] rounded-3xl p-10 md:p-14 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to Apply What You Learned?</h2>
            <p className="text-white/70 mb-8">
              Build a professional, ATS-friendly resume in minutes. Free, no credit card required.
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
