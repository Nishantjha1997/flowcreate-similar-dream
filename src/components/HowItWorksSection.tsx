import { ArrowRight, CheckCircle2, FileText, Search, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useDesignMode } from '@/hooks/useDesignMode';

const steps = [
  {
    number: '01',
    icon: FileText,
    title: 'Start with your story',
    description: 'Add your experience, projects, skills, and goals once. MakeCV gives your raw notes a clear professional structure.',
  },
  {
    number: '02',
    icon: Search,
    title: 'Aim at the role',
    description: 'Paste a job description to see the keywords and strengths that matter most for the opportunity in front of you.',
  },
  {
    number: '03',
    icon: Sparkles,
    title: 'Polish, check, apply',
    description: 'Use focused AI suggestions, choose a template, and export a resume that feels like you and reads cleanly to an ATS.',
  },
];

export default function HowItWorksSection() {
  const { isNeoBrutalism } = useDesignMode();

  return (
    <section className={isNeoBrutalism ? 'py-24 bg-[#FFF7ED] dark:bg-orange-950 border-y-[4px] border-foreground' : 'apple-section bg-background'}>
      <div className="container mx-auto px-4">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end max-w-6xl mx-auto mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-primary font-semibold mb-4">A calmer way to apply</p>
            <h2 className={isNeoBrutalism ? 'text-4xl font-black tracking-tight text-foreground uppercase' : 'apple-headline'}>
              One strong base.<br /><span className="text-muted-foreground">Every role, better matched.</span>
            </h2>
          </div>
          <p className="apple-subheadline max-w-xl lg:ml-auto lg:pb-1">
            Build your profile once, then shape the story for the opportunity you actually want. Less formatting, more momentum.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 max-w-6xl mx-auto">
          {steps.map(({ number, icon: Icon, title, description }) => (
            <article
              key={number}
              className={isNeoBrutalism
                ? 'group bg-background border-[3px] border-foreground p-7 nb-card'
                : 'group rounded-3xl border border-border/50 bg-[hsl(var(--surface-elevated))] p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl'}
            >
              <div className="flex items-center justify-between mb-12">
                <div className="h-11 w-11 rounded-2xl bg-[hsl(var(--surface-dark))] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">{number}</span>
              </div>
              <h3 className="text-lg font-semibold tracking-tight mb-3">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>

        <div className="max-w-6xl mx-auto mt-8 rounded-3xl bg-[hsl(var(--surface-dark))] px-6 py-5 md:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-white">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/70">
            <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> ATS-readable layouts</span>
            <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Job-specific guidance</span>
            <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> No credit card to start</span>
          </div>
          <Link to="/resume-builder" className="shrink-0">
            <Button className="rounded-full bg-white text-[hsl(var(--surface-dark))] hover:bg-white/90">
              Build your base resume <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
