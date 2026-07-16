import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Users, TrendingUp, Mic, MessageSquare, Target } from 'lucide-react';
import { ScrollReveal } from '@/hooks/useScrollAnimation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { blogPosts } from '@/data/blogPosts';

const careerArticles = blogPosts.filter((p) => p.category === 'Career Advice');

const adviceTopics = [
  {
    title: 'Resume Writing',
    description: 'Master the art of resume writing with guides on formatting, keywords, achievements, and tailoring your resume for each application.',
    icon: FileText,
    link: '/blog/ats-friendly-resume-guide',
  },
  {
    title: 'Interview Preparation',
    description: 'Prepare for behavioral, technical, and case interviews. Learn the STAR method and how to answer tough questions.',
    icon: Mic,
    link: '/blog',
  },
  {
    title: 'Salary Negotiation',
    description: 'Learn how to research salary ranges, make a compelling counter-offer, and negotiate total compensation confidently.',
    icon: TrendingUp,
    link: '/blog',
  },
  {
    title: 'Networking Strategies',
    description: 'Build meaningful professional relationships on LinkedIn, at events, and within your industry to uncover hidden opportunities.',
    icon: Users,
    link: '/blog',
  },
  {
    title: 'Job Search Strategy',
    description: 'Develop a systematic approach to your job search — from identifying target companies to tracking applications and follow-ups.',
    icon: Target,
    link: '/blog',
  },
  {
    title: 'Career Pivots',
    description: 'Switching industries or roles? Learn how to identify transferable skills and tell a compelling career-change story.',
    icon: MessageSquare,
    link: '/blog/career-change-resume-guide',
  },
];

const CareerAdvice = () => {
  usePageMeta({
    title: 'Career Advice & Job Search Tips',
    description: 'Expert career advice to help you write better resumes, ace interviews, negotiate salaries, and advance your career. Free guides and resources.',
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center mb-14">
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
              Career Advice & Job Search Tips
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Expert guidance to help you navigate every stage of your career — from resume writing to salary negotiation.
            </p>
          </div>
          </ScrollReveal>

          {/* Topic Cards */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {adviceTopics.map((topic, i) => (
              <ScrollReveal key={topic.title} delay={i * 50}>
              <Link to={topic.link} className="group block h-full">
                <div className="rounded-xl border p-6 hover:border-primary hover:shadow-md transition-all h-full flex flex-col">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <topic.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{topic.title}</h3>
                  <p className="text-sm text-muted-foreground flex-1">{topic.description}</p>
                </div>
              </Link>
              </ScrollReveal>
            ))}
          </div>

          {/* Featured Articles */}
          {careerArticles.length > 0 && (
            <ScrollReveal delay={150}>
            <div className="max-w-4xl mx-auto mb-16">
              <h2 className="text-2xl font-bold mb-6 text-center">Featured Career Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {careerArticles.map((article) => (
                  <Link key={article.slug} to={`/blog/${article.slug}`} className="group block">
                    <div className="rounded-xl border p-6 hover:border-primary hover:shadow-md transition-all">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        Career Advice
                      </span>
                      <h3 className="font-semibold mt-3 mb-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{article.excerpt}</p>
                      <p className="text-xs text-muted-foreground mt-3">{article.readTime}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            </ScrollReveal>
          )}

          <ScrollReveal delay={200}>
          <div className="max-w-3xl mx-auto bg-[hsl(var(--surface-dark))] rounded-3xl p-10 md:p-14 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Put This Advice Into Action</h2>
            <p className="text-white/70 mb-8 max-w-md mx-auto">
              Build a resume that puts your best foot forward. Free templates, ATS-friendly formatting, instant PDF download.
            </p>
            <Link to="/resume-builder">
              <Button size="lg" variant="secondary" className="rounded-full px-8 h-12">
                Build Your Resume Now <ArrowRight className="ml-2 h-4 w-4" />
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

export default CareerAdvice;
