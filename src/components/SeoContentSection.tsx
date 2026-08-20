import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  Download,
  Layers,
  Award,
} from 'lucide-react';
import { useDesignMode } from '@/hooks/useDesignMode';

export const FAQ_ITEMS = [
  {
    question: 'How do I make a CV online for free with MakeCV?',
    answer:
      'Making a CV online on MakeCV takes just three steps: 1) Select one of our 30+ ATS-optimized templates, 2) Enter your work experience, education, and skills (or use our AI bullet assistant to polish your text), and 3) Download your high-resolution, recruiter-ready PDF instantly without hidden fees.',
  },
  {
    question: 'What is the best way to make your resume stand out to employers?',
    answer:
      'To make your resume stand out, focus on quantifiable achievements rather than generic job duties. Use strong action verbs (e.g., "Architected", "Accelerated", "Scaled"), tailor your keywords to match the specific job description, and use a clean, ATS-compliant single- or two-column layout that recruiters can scan in 6 seconds.',
  },
  {
    question: 'Are resumes made on MakeCV compliant with ATS (Applicant Tracking Systems)?',
    answer:
      'Yes, 100%. Every template on MakeCV is engineered according to modern ATS parsing standards. Our export engine generates standard semantic text layers without nested text boxes, unreadable tables, or unsupported graphics, ensuring full compatibility with Workday, Greenhouse, Lever, Taleo, and BambooHR.',
  },
  {
    question: 'What is the difference between making a resume and making a CV?',
    answer:
      'In the United States and Canada, a resume is a concise 1-to-2 page summary of skills and experience tailored for private-sector jobs, while a CV (Curriculum Vitae) is a longer, comprehensive academic record. In the UK, Europe, Australia, and India, "CV" and "resume" are used interchangeably for job applications. MakeCV supports both formats seamlessly.',
  },
  {
    question: 'Can I make my resume match a specific job description?',
    answer:
      'Yes! MakeCV includes an AI Job Match Analyzer. Simply paste the job description of the role you want, and our tool compares your resume against the posting, calculates a match score, highlights missing keywords, and provides one-click suggestions to tailor your resume.',
  },
  {
    question: 'Can I download my resume or CV as a PDF for free?',
    answer:
      'Yes, MakeCV allows you to create and export clean, professional PDF resumes ready for immediate job applications. There are no surprise watermarks or credit-card lockouts.',
  },
  {
    question: 'How does AI help when I make my resume online?',
    answer:
      'MakeCV incorporates intelligent AI assistance that helps you write compelling summary statements, refine weak bullet points into metric-driven accomplishment statements, fix grammar, organize technical skills, and translate your profile into multiple languages.',
  },
];

export const HOW_TO_STEPS = [
  {
    step: '1',
    title: 'Choose a Professional Template',
    description:
      'Select from over 30 designer-crafted, ATS-friendly templates tailored for tech, business, creative, healthcare, and entry-level positions.',
    icon: Layers,
  },
  {
    step: '2',
    title: 'Enter or Import Your Information',
    description:
      'Quickly fill in your work history, education, skills, and projects, or import your existing LinkedIn / master profile data.',
    icon: FileText,
  },
  {
    step: '3',
    title: 'Enhance with AI Suggestions',
    description:
      'Use one-click AI writing tools to polish bullet points, highlight relevant metrics, and eliminate typos and passive phrases.',
    icon: Sparkles,
  },
  {
    step: '4',
    title: 'Target the Job Description & Download',
    description:
      'Run an instant ATS keyword audit against your dream job posting, make final adjustments, and download your recruiter-ready PDF.',
    icon: Download,
  },
];

export default function SeoContentSection() {
  const { isNeoBrutalism } = useDesignMode();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <section className="py-20 md:py-28 bg-muted/30 border-t border-border/40">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            <Zap className="h-3.5 w-3.5" /> Fast & Free Online CV Maker
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
            Make CV & Resume Online Free — Land Your Dream Job Faster
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Everything you need to make your resume, create a winning CV, and pass automated ATS filters.
            Built with modern AI tools, recruiter-backed formats, and instant PDF download.
          </p>
        </div>

        {/* 4 Pillars of Making a CV on MakeCV */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <div className="bg-background rounded-2xl p-6 border border-border/60 shadow-sm hover:border-primary/40 transition-all">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Make CV in Minutes</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Intuitive drag-and-drop builder with real-time formatting. Build your resume quickly with zero design experience required.
            </p>
          </div>

          <div className="bg-background rounded-2xl p-6 border border-border/60 shadow-sm hover:border-primary/40 transition-all">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI-Powered Writing</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Generate strong bullet points, summarize work history, and tailor content specifically to your target job titles.
            </p>
          </div>

          <div className="bg-background rounded-2xl p-6 border border-border/60 shadow-sm hover:border-primary/40 transition-all">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">100% ATS-Friendly</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Clean typography and structured semantic layout tested on top Applicant Tracking Systems like Workday and Greenhouse.
            </p>
          </div>

          <div className="bg-background rounded-2xl p-6 border border-border/60 shadow-sm hover:border-primary/40 transition-all">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Download className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Instant PDF Export</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Download high-definition PDF files formatted for standard letter & A4 dimensions with zero paywall traps.
            </p>
          </div>
        </div>

        {/* How to Make a Resume Guide */}
        <div className="bg-background rounded-3xl p-8 sm:p-12 border border-border/60 shadow-sm mb-20">
          <div className="max-w-3xl mb-10">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
              How to Make Your Resume Online in 4 Simple Steps
            </h3>
            <p className="text-muted-foreground text-base">
              Follow this step-by-step process to build an interview-winning CV that highlights your strengths.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_TO_STEPS.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div key={idx} className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      {item.step}
                    </span>
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="text-base font-semibold text-foreground mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>No software installation required · Works in all browsers & mobile devices</span>
            </div>
            <Link to="/resume-builder">
              <Button size="lg" className="rounded-full px-7">
                Make Your Resume Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Why MakeCV Section (Keyword rich) */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-3">
              <Award className="h-4 w-4" /> Why Choose MakeCV
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-4">
              Make a CV That Passes the 6-Second Recruiter Test
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Recruiters receive hundreds of applications for every open position and spend an average of just 6 seconds scanning each resume before making a decision. MakeCV solves this problem by structuring your experience in an eye-tracking-optimized hierarchy.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Targeted Keyword Density</h4>
                  <p className="text-xs text-muted-foreground">Match skills and phrases directly from the job posting to ensure your resume scores high on automated ATS ranking algorithms.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Action Verb & Impact Formula</h4>
                  <p className="text-xs text-muted-foreground">Transform passive bullet points into results-oriented statements: [Action Verb] + [Context/Task] + [Measurable Result].</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Comprehensive Industry Templates</h4>
                  <p className="text-xs text-muted-foreground">Whether you need a tech developer CV, corporate finance resume, nursing portfolio, or academic curriculum vitae, we have a template built for your field.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-3xl p-8 border border-primary/20 space-y-6">
            <h4 className="text-xl font-bold text-foreground">Popular Keyword Searches We Support:</h4>
            <div className="flex flex-wrap gap-2">
              {[
                'make resume',
                'make cv',
                'make your resume',
                'make cv online',
                'make resume online',
                'free resume builder',
                'ATS resume template',
                'online resume maker',
                'CV maker online',
                'professional resume creator',
                'AI resume builder',
                'create resume free',
              ].map((kw, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full bg-background border border-border/80 text-xs font-medium text-foreground/80 hover:border-primary transition-colors"
                >
                  {kw}
                </span>
              ))}
            </div>

            <div className="pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-4">
                Ready to create an ATS-proof resume that lands more interviews?
              </p>
              <Link to="/resume-builder" className="w-full">
                <Button className="w-full rounded-full">
                  Make Your Resume for Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
              <HelpCircle className="h-3.5 w-3.5" /> Common Questions
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
              Frequently Asked Questions About Making a CV Online
            </h3>
            <p className="text-muted-foreground text-sm">
              Everything you need to know about building, customizing, and downloading your resume on MakeCV.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-border/70 bg-background overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-medium text-foreground hover:text-primary transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-semibold">{item.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-primary' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-border/30">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
