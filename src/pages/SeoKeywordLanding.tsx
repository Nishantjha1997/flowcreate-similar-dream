import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TemplatesCarousel from '@/components/TemplatesCarousel';
import SeoContentSection from '@/components/SeoContentSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, FileText, Sparkles, ShieldCheck, Download, Award, Zap } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ScrollReveal } from '@/hooks/useScrollAnimation';

interface SeoKeywordLandingProps {
  keyword: 'make-cv' | 'make-resume' | 'cv-maker';
}

const PAGE_DATA = {
  'make-cv': {
    title: 'Make CV Online Free — Fast & Professional CV Maker',
    metaTitle: 'Make CV Online Free — Make Your CV in Minutes | MakeCV',
    metaDescription:
      'Make your CV online for free with MakeCV. Choose from 30+ ATS-friendly templates, customize with AI bullet point suggestions, and download your polished PDF instantly.',
    headline: 'Make Your CV Online Free in Minutes',
    subheadline:
      'Build a recruiter-approved, ATS-compliant curriculum vitae with intelligent AI assistance and 30+ modern templates.',
    primaryCta: 'Make My CV Now',
    secondaryCta: 'Browse CV Templates',
  },
  'make-resume': {
    title: 'Make Resume Online Free — ATS Resume Builder',
    metaTitle: 'Make Resume Online Free — Make Your Resume with AI | MakeCV',
    metaDescription:
      'Make your resume online for free with MakeCV. Build an ATS-optimized resume tailored to any job description with AI suggestions and instant PDF export.',
    headline: 'Make Your Resume Online for Free',
    subheadline:
      'Turn your experience into an interview-winning resume. Fast, modern, and guaranteed to pass Applicant Tracking Systems.',
    primaryCta: 'Make My Resume Now',
    secondaryCta: 'Explore Resume Templates',
  },
  'cv-maker': {
    title: 'Online CV Maker — Create Professional CVs for Free',
    metaTitle: 'Online CV Maker — Create & Download Free CVs | MakeCV',
    metaDescription:
      'The #1 free online CV maker. Create a standout curriculum vitae with ATS-friendly layouts, AI writing tools, and high-resolution PDF download.',
    headline: 'The Free Online CV Maker Built for Results',
    subheadline:
      'Create a standout CV tailored to your industry with expert layouts, AI sentence enhancements, and 100% ATS compatibility.',
    primaryCta: 'Start Making Your CV',
    secondaryCta: 'View Template Designs',
  },
};

export default function SeoKeywordLanding({ keyword }: SeoKeywordLandingProps) {
  const data = PAGE_DATA[keyword];

  usePageMeta({
    title: data.metaTitle,
    description: data.metaDescription,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Keyword Hero */}
        <section className="relative overflow-hidden bg-[hsl(var(--surface-dark))] text-white py-24 md:py-32">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px]" />
          </div>

          <div className="container mx-auto px-4 relative z-10 max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
              <Zap className="h-3.5 w-3.5" /> 100% Free Online Resume & CV Builder
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
              {data.headline}
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-3xl mx-auto mb-10 leading-relaxed">
              {data.subheadline}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link to="/resume-builder" className="w-full sm:w-auto">
                <Button size="lg" className="rounded-full px-8 h-12 text-base font-semibold w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  {data.primaryCta} <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/templates" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base font-semibold w-full border-white/20 text-white hover:bg-white/10">
                  {data.secondaryCta}
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-sm text-white/60">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> 30+ ATS Templates</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Free PDF Downloads</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> AI Bullet Polisher</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> No Credit Card Required</span>
            </div>
          </div>
        </section>

        {/* Templates Carousel */}
        <ScrollReveal>
          <TemplatesCarousel />
        </ScrollReveal>

        {/* Feature Highlights for Target Keywords */}
        <section className="py-16 bg-background border-b border-border/50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="rounded-2xl p-6 border border-border/60 bg-muted/20">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold mb-2">Guaranteed ATS Compatibility</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every template passes strict parsing tests for Workday, Taleo, Greenhouse, and Lever so your application reaches human recruiters.
                </p>
              </div>

              <div className="rounded-2xl p-6 border border-border/60 bg-muted/20">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold mb-2">Smart AI Job Matcher</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Paste the job posting to discover missing keywords and get automated suggestions to tailor your resume for maximum impact.
                </p>
              </div>

              <div className="rounded-2xl p-6 border border-border/60 bg-muted/20">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Download className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold mb-2">One-Click PDF Export</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Generate crystal-clear vector PDFs ready for online submission without unexpected watermarks or lockouts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Rich SEO Content Section (How-to + FAQ) */}
        <ScrollReveal>
          <SeoContentSection />
        </ScrollReveal>

        {/* Testimonials */}
        <ScrollReveal delay={100}>
          <TestimonialsSection />
        </ScrollReveal>

        {/* Final CTA */}
        <section className="py-20 bg-[hsl(var(--surface-dark))] text-white text-center">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Make Your Resume & Land More Interviews?
            </h2>
            <p className="text-base text-white/70 mb-8 max-w-xl mx-auto">
              Join over 12,000+ job seekers who built their resumes and CVs with MakeCV. Free, fast, and effortless.
            </p>
            <Link to="/resume-builder">
              <Button size="lg" className="rounded-full px-8 h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                {data.primaryCta} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
