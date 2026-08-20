import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ScrollReveal } from '@/hooks/useScrollAnimation';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  FileText,
  Download,
  Share2,
  Clock,
  Layout,
  PenTool,
  CheckCircle2,
  Star,
  ArrowRight,
  Layers,
  Globe,
  Zap,
  ShieldCheck,
  Target,
  Sparkles,
  Award,
} from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';

const Features = () => {
  usePageMeta({
    title: 'MakeCV Features — AI Resume Builder, ATS Checker & Templates',
    description: 'Explore MakeCV features: 30+ ATS-optimized templates, real-time live preview, AI bullet suggestions, job description keyword matching, and instant PDF download.',
  });

  const featurePillars = [
    {
      category: 'ATS & Formatting Engine',
      icon: ShieldCheck,
      description: 'Engineered from the ground up to guarantee flawless parsing across all applicant tracking systems.',
      items: [
        {
          title: '30+ ATS-Certified Templates',
          description: 'Single-column and dual-column layouts tested against Workday, Taleo, Greenhouse, and Lever.',
        },
        {
          title: 'Zero Canvas / Image Traps',
          description: 'Standard semantic text hierarchy ensuring your text, skills, and dates are never dropped by parsers.',
        },
        {
          title: 'Real-Time Layout Engine',
          description: 'Auto-adjusts typography and margins dynamically to eliminate accidental 2nd page overflow.',
        },
      ],
    },
    {
      category: 'AI Writing & Job Match Assistant',
      icon: Sparkles,
      description: 'Turn uninspired bullet points into metric-heavy accomplishment statements that demand interviews.',
      items: [
        {
          title: 'AI Bullet Point Polish',
          description: 'Converts passive duties into action-verb statements with quantifiable metrics and impact.',
        },
        {
          title: 'Job Description Matcher',
          description: 'Paste any job posting to calculate match percentage, find missing skills, and optimize keywords.',
        },
        {
          title: 'Professional Summary Generator',
          description: 'Generate compelling 2-sentence executive summaries tailored to your exact career target.',
        },
      ],
    },
    {
      category: 'Export, Cloud & Application Suite',
      icon: Layers,
      description: 'Everything you need to manage multiple career tracks and apply with confidence.',
      items: [
        {
          title: 'Instant PDF & Docx Export',
          description: 'High-resolution vector PDF generation with zero paywall traps or unwanted watermarks.',
        },
        {
          title: 'Matching Cover Letter Suite',
          description: 'Generate cover letters that match your resume template typography, colors, and header style.',
        },
        {
          title: 'Multi-Language Translation',
          description: 'One-click resume translation into Spanish, French, German, and 10+ global languages.',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-28 bg-[hsl(var(--surface-dark))] text-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
          </div>

          <div className="container mx-auto px-4 max-w-5xl text-center relative z-10">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
                <Zap className="h-3.5 w-3.5" /> Complete Resume Suite
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
                Everything You Need to Build Resumes That Get Hired
              </h1>
              <p className="text-lg text-white/70 max-w-3xl mx-auto mb-10 leading-relaxed">
                Combining recruiter-tested design principles with cutting-edge AI assistance to help you land more interviews in less time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/resume-builder">
                  <Button size="lg" className="rounded-full px-8 h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl">
                    Try All Features Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/templates">
                  <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base font-medium border-white/20 text-white hover:bg-white/10">
                    Explore Templates
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 3 Core Pillars */}
        <section className="py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid lg:grid-cols-3 gap-8">
              {featurePillars.map((pillar, idx) => {
                const IconComponent = pillar.icon;
                return (
                  <ScrollReveal key={idx} delay={idx * 100}>
                    <div className="rounded-3xl border border-border/80 p-8 bg-card shadow-sm h-full flex flex-col justify-between hover:border-primary/40 transition-all">
                      <div>
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-3">{pillar.category}</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                          {pillar.description}
                        </p>

                        <div className="space-y-6">
                          {pillar.items.map((item, itemIdx) => (
                            <div key={itemIdx} className="space-y-1">
                              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                {item.title}
                              </h3>
                              <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                                {item.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Competitor Comparison Matrix */}
        <section className="py-20 bg-muted/30 border-y border-border/40">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold tracking-tight text-foreground mb-3">
                Why Job Seekers Choose MakeCV
              </h2>
              <p className="text-base text-muted-foreground max-w-xl mx-auto">
                Compare MakeCV with traditional word processors and generic design platforms.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse bg-background rounded-2xl border border-border/70 overflow-hidden shadow-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="p-4 sm:p-5">Feature</th>
                    <th className="p-4 sm:p-5 text-primary">MakeCV</th>
                    <th className="p-4 sm:p-5">Microsoft Word</th>
                    <th className="p-4 sm:p-5">Canva</th>
                  </tr>
                </thead>
                <tbody className="text-xs sm:text-sm divide-y divide-border/50">
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold">100% ATS Compliant</td>
                    <td className="p-4 sm:p-5 text-emerald-600 font-bold">✅ Yes (Guaranteed)</td>
                    <td className="p-4 sm:p-5 text-muted-foreground">⚠️ Manual formatting required</td>
                    <td className="p-4 sm:p-5 text-destructive">❌ No (Graphics break parsers)</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold">AI Job Match Keyword Scanner</td>
                    <td className="p-4 sm:p-5 text-emerald-600 font-bold">✅ Built-in (1-Click)</td>
                    <td className="p-4 sm:p-5 text-destructive">❌ No</td>
                    <td className="p-4 sm:p-5 text-destructive">❌ No</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold">Free Watermark-Free PDF Export</td>
                    <td className="p-4 sm:p-5 text-emerald-600 font-bold">✅ Yes</td>
                    <td className="p-4 sm:p-5 text-emerald-600">✅ Yes</td>
                    <td className="p-4 sm:p-5 text-muted-foreground">⚠️ Free with limitations</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold">One-Click Template Switching</td>
                    <td className="p-4 sm:p-5 text-emerald-600 font-bold">✅ Instant (Preserves text)</td>
                    <td className="p-4 sm:p-5 text-destructive">❌ Must re-type layout</td>
                    <td className="p-4 sm:p-5 text-destructive">❌ Must redesign layout</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold">Matching Cover Letter Suite</td>
                    <td className="p-4 sm:p-5 text-emerald-600 font-bold">✅ Included</td>
                    <td className="p-4 sm:p-5 text-destructive">❌ Separate file</td>
                    <td className="p-4 sm:p-5 text-destructive">❌ Separate file</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-20 bg-[hsl(var(--surface-dark))] text-white text-center">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Experience the MakeCV Advantage Today
            </h2>
            <p className="text-base text-white/70 mb-8 max-w-xl mx-auto">
              Join thousands of job seekers who build interview-winning resumes with MakeCV. Free, fast, and 100% ATS-friendly.
            </p>
            <Link to="/resume-builder">
              <Button size="lg" className="rounded-full px-8 h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                Start Building Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Features;
