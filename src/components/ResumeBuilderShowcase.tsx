import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  ShieldCheck,
  Target,
  FileCheck2,
  Languages,
  ArrowRight,
  CheckCircle2,
  Zap,
  MousePointerClick,
  FileText,
} from 'lucide-react';
import { useDesignMode } from '@/hooks/useDesignMode';

const FEATURES = [
  {
    id: 'ai-bullets',
    icon: Sparkles,
    badge: 'AI Writing Assistant',
    title: 'Pre-written phrases & bullet polish',
    subtitle: 'Stop staring at a blank page. Transform raw duties into metric-driven accomplishments in one click.',
    previewTitle: 'Senior Software Engineer · Acme Corp',
    previewBefore: '• Worked on backend APIs and fixed bugs.',
    previewAfter: '• Architected high-throughput REST APIs reducing checkout latency by 38% for 2.4M monthly active users.',
    highlightText: 'Boosted recruiter engagement by 3.2x',
  },
  {
    id: 'ats-formatting',
    icon: ShieldCheck,
    badge: '100% ATS-Compliant',
    title: 'Automated formatting that never breaks',
    subtitle: 'Never struggle with Word margins or misaligned tables. Every template is strictly formatted for ATS parsers.',
    previewTitle: 'Applicant Tracking System Audit',
    previewBefore: '❌ Complex tables & floating text boxes (Parse failure in Taleo & Workday)',
    previewAfter: '✅ Semantic text layer with standard headings (100% Parsed in Greenhouse & Lever)',
    highlightText: '98% Average ATS Compatibility Score',
  },
  {
    id: 'job-matching',
    icon: Target,
    badge: 'Job Description Matcher',
    title: 'Tailor your resume to any job in seconds',
    subtitle: 'Paste the job posting to calculate your ATS match percentage and instantly identify missing skills.',
    previewTitle: 'Target Role: Senior Product Manager',
    previewBefore: 'Missing: "Cross-functional roadmap", "A/B testing", "SQL"',
    previewAfter: 'Matched: Added 3 missing competencies directly to Skills and Experience sections.',
    highlightText: 'Matches 95%+ of target keywords',
  },
  {
    id: 'cover-letters',
    icon: FileText,
    badge: 'Matching Cover Letters',
    title: 'Generate matching cover letters',
    subtitle: 'Build a cohesive job application with cover letter templates designed to match your resume style.',
    previewTitle: 'Design Consistency',
    previewBefore: 'Mismatched fonts & layouts across documents',
    previewAfter: 'Unified typography, accent colors, and contact headers across resume & cover letter.',
    highlightText: 'Cohesive branding that recruiters remember',
  },
];

export default function ResumeBuilderShowcase() {
  const { isNeoBrutalism } = useDesignMode();
  const [activeTab, setActiveTab] = useState(0);
  const activeFeature = FEATURES[activeTab];

  return (
    <section className="py-20 md:py-28 bg-background border-b border-border/40">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            <Zap className="h-3.5 w-3.5" /> Built for Results
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
            Features Designed to Help You Get Hired
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Every feature in MakeCV is built with feedback from recruiters and career coaches to give your application a competitive edge.
          </p>
        </div>

        {/* Feature Tabs Bar */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            const isActive = activeTab === idx;
            return (
              <button
                key={feature.id}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{feature.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Feature Showcase Card */}
        <div className="bg-[hsl(var(--surface-dark))] text-white rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="grid lg:grid-cols-2 gap-10 items-center relative z-10">
            {/* Feature Description Column */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
                <activeFeature.icon className="h-3.5 w-3.5" /> {activeFeature.badge}
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">
                {activeFeature.title}
              </h3>
              <p className="text-white/70 text-base leading-relaxed mb-6">
                {activeFeature.subtitle}
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2.5 text-sm text-white/90">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>{activeFeature.highlightText}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-white/90">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Real-time live preview with instant undo/redo</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-white/90">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Free PDF export with zero watermarks</span>
                </div>
              </div>

              <Link to="/resume-builder">
                <Button size="lg" className="rounded-full px-7 bg-primary text-primary-foreground hover:bg-primary/90">
                  Try it in the builder <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Interactive Live Comparison / Mockup Box */}
            <div className="bg-background text-foreground rounded-2xl p-6 sm:p-8 border border-white/15 shadow-xl">
              <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {activeFeature.previewTitle}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> MakeCV Optimized
                </span>
              </div>

              {/* Before */}
              <div className="mb-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Standard Generic Resume
                </div>
                <div className="p-3.5 rounded-xl bg-destructive/5 border border-destructive/20 text-xs text-muted-foreground leading-relaxed line-through decoration-destructive/40">
                  {activeFeature.previewBefore}
                </div>
              </div>

              {/* After */}
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-primary mb-1.5 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> MakeCV AI-Optimized
                </div>
                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs font-medium text-foreground leading-relaxed">
                  {activeFeature.previewAfter}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
