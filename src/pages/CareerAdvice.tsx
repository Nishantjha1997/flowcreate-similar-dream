import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Users, TrendingUp, Mic, MessageSquare, Target, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { ScrollReveal } from '@/hooks/useScrollAnimation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { blogPosts } from '@/data/blogPosts';
import { professions } from '@/data/professions';

const careerArticles = blogPosts;
const topProfessions = professions.slice(0, 8);

const adviceTopics = [
  {
    title: 'ATS Resume Writing',
    description: 'Master the art of resume writing with guides on ATS formatting, keyword density, and tailoring your resume for automated scanners.',
    icon: FileText,
    link: '/blog/ats-friendly-resume-guide',
    linkText: 'Read ATS Guide',
  },
  {
    title: 'Common Application Mistakes',
    description: 'Learn the 10 most common mistakes that cause instant rejections and how to fix them before submitting your next application.',
    icon: Mic,
    link: '/blog/resume-mistakes-to-avoid',
    linkText: 'Avoid Mistakes',
  },
  {
    title: 'Industry Keywords & Skills',
    description: 'Discover the exact high-impact keywords and skills recruiters search for in technology, finance, healthcare, and marketing.',
    icon: Target,
    link: '/blog/resume-keywords-by-industry',
    linkText: 'Explore Keywords',
  },
  {
    title: 'Career Pivots & Transitions',
    description: 'Switching industries or roles? Learn how to identify transferable skills and reframe your background for new hiring managers.',
    icon: MessageSquare,
    link: '/blog/career-change-resume-guide',
    linkText: 'Read Pivot Guide',
  },
  {
    title: 'Career Tool Selection',
    description: 'Understand the difference between free and premium resume builders, AI writing tools, and when upgrading makes sense.',
    icon: TrendingUp,
    link: '/blog/free-vs-paid-resume-builders',
    linkText: 'Compare Tools',
  },
  {
    title: 'Role-Specific CVs',
    description: 'Browse curated, recruiter-approved resume templates tailored for your specific profession and target seniority.',
    icon: Users,
    link: '/templates',
    linkText: 'Browse Templates',
  },
];

const CareerAdvice = () => {
  usePageMeta({
    title: 'Career Advice & Job Search Tips | MakeCV',
    description: 'Expert career advice, ATS resume writing guides, industry keywords, and job search strategies to help you land more interviews.',
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="h-3.5 w-3.5" /> Career Growth & Job Search Hub
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
              Career Advice & Job Search Tips
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Actionable guides, keyword strategies, and proven tactics to help you navigate every stage of your career.
            </p>
          </div>
          </ScrollReveal>

          {/* Topic Cards */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {adviceTopics.map((topic, i) => (
              <ScrollReveal key={topic.title} delay={i * 50}>
              <Link to={topic.link} className="group block h-full">
                <div className="rounded-2xl border border-border/60 p-6 hover:border-primary hover:shadow-md transition-all h-full flex flex-col bg-card">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    <topic.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{topic.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">{topic.description}</p>
                  <span className="text-sm text-primary font-medium inline-flex items-center gap-1">
                    {topic.linkText} <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
              </ScrollReveal>
            ))}
          </div>

          {/* Featured Career Articles */}
          <ScrollReveal delay={150}>
          <div className="max-w-5xl mx-auto mb-16">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Featured Career Articles</h2>
                <p className="text-sm text-muted-foreground mt-1">Deep-dive guides written by recruitment and career experts.</p>
              </div>
              <Link to="/blog">
                <Button variant="outline" size="sm" className="rounded-full">
                  <BookOpen className="h-4 w-4 mr-2" /> Visit All Blog Posts
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {careerArticles.map((article) => (
                <Link key={article.slug} to={`/blog/${article.slug}`} className="group block">
                  <div className="rounded-2xl border border-border/60 p-6 hover:border-primary hover:shadow-md transition-all bg-card h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          {article.category}
                        </span>
                        <span className="text-xs text-muted-foreground">{article.readTime}</span>
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{article.excerpt}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/40 flex items-center text-xs font-semibold text-primary">
                      Read Full Article <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          </ScrollReveal>

          {/* Role-Specific Resume Templates Callout */}
          <ScrollReveal delay={200}>
          <div className="max-w-5xl mx-auto mb-16 rounded-3xl border border-border/70 p-8 sm:p-10 bg-muted/30">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Resume Templates Tailored to Your Profession
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Pair your career strategy with industry-tested, ATS-friendly templates pre-loaded with relevant sections.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {topProfessions.map((p) => (
                <Link
                  key={p.slug}
                  to={`/resume-template/${p.slug}`}
                  className="p-3.5 rounded-xl border border-border/50 bg-background hover:border-primary hover:shadow-sm transition-all text-center group"
                >
                  <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {p.title.replace(' Resume Template', '')}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{p.category}</p>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <Link to="/templates">
                <Button variant="ghost" size="sm" className="text-xs font-semibold">
                  Browse All 30+ Profession Templates <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
          </ScrollReveal>

          {/* Bottom CTA */}
          <ScrollReveal delay={250}>
          <div className="max-w-4xl mx-auto bg-[hsl(var(--surface-dark))] rounded-3xl p-10 md:p-14 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Put This Advice Into Action</h2>
            <p className="text-white/70 mb-8 max-w-md mx-auto text-sm sm:text-base">
              Build a resume that stands out to recruiters. Free templates, ATS-friendly formatting, and instant PDF download.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/resume-builder" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="rounded-full px-8 h-12 w-full">
                  Build Your Resume Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/templates" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-12 w-full text-white border-white/20 hover:bg-white/10">
                  Explore Templates
                </Button>
              </Link>
            </div>
          </div>
          </ScrollReveal>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CareerAdvice;
