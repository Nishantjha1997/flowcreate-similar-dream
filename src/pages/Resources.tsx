import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, BookOpen, Briefcase, HelpCircle, Palette } from 'lucide-react';
import { ScrollReveal } from '@/hooks/useScrollAnimation';
import { usePageMeta } from '@/hooks/usePageMeta';

const resources = [
  {
    title: 'Resume Templates',
    description: 'Browse 30+ professionally designed resume templates for every industry and career stage.',
    icon: Palette,
    link: '/templates',
    linkText: 'Browse Templates',
  },
  {
    title: 'Resume Templates by Profession',
    description: 'Find the perfect resume template tailored to your specific job title and industry.',
    icon: Briefcase,
    link: '/resume-template/software-engineer',
    linkText: 'Find Your Profession',
  },
  {
    title: 'Blog & Articles',
    description: 'Expert resume writing tips, ATS optimization guides, and career advice.',
    icon: BookOpen,
    link: '/blog',
    linkText: 'Read Articles',
  },
  {
    title: 'Example Resumes',
    description: 'Real-world resume examples across industries to inspire your own.',
    icon: FileText,
    link: '/examples',
    linkText: 'View Examples',
  },
  {
    title: 'Career Advice',
    description: 'Job search strategies, interview preparation, salary negotiation, and career growth tips.',
    icon: Briefcase,
    link: '/career-advice',
    linkText: 'Get Advice',
  },
  {
    title: 'Help Center',
    description: 'Get support, submit a ticket, or find answers to common questions.',
    icon: HelpCircle,
    link: '/help',
    linkText: 'Visit Help Center',
  },
];

const Resources = () => {
  usePageMeta({
    title: 'Free Resume Resources & Tools',
    description: 'Free resume templates, examples, career advice, and job search resources. Everything you need to build a professional resume and land more interviews.',
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center mb-14">
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
              Free Resume Resources
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build a standout resume — templates, examples, guides, and career advice.
            </p>
          </div>
          </ScrollReveal>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {resources.map((res, i) => (
              <ScrollReveal key={res.title} delay={i * 50}>
              <Link to={res.link} className="group block h-full">
                <div className="rounded-xl border p-6 hover:border-primary hover:shadow-md transition-all h-full flex flex-col">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <res.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{res.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">{res.description}</p>
                  <span className="text-sm text-primary font-medium inline-flex items-center gap-1">
                    {res.linkText} <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={200}>
          <div className="max-w-3xl mx-auto bg-[hsl(var(--surface-dark))] rounded-3xl p-10 md:p-14 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to Build Your Resume?</h2>
            <p className="text-white/70 mb-8 max-w-md mx-auto">
              Everything on this page is free. Start building your professional resume now — no credit card required.
            </p>
            <Link to="/resume-builder">
              <Button size="lg" variant="secondary" className="rounded-full px-8 h-12">
                Create My Free Resume <ArrowRight className="ml-2 h-4 w-4" />
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

export default Resources;
