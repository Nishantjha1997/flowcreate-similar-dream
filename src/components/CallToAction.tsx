import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useDesignMode } from '@/hooks/useDesignMode';

const CallToAction = () => {
  const { isNeoBrutalism } = useDesignMode();

  if (isNeoBrutalism) {
    return (
      <section className="py-20 bg-[#FFE135] border-t-[6px] border-foreground">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-black uppercase text-foreground mb-4">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-lg font-mono text-foreground/80 mb-8 max-w-xl mx-auto">
            Build your professional, ATS-optimized resume in minutes. Free forever to start.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/resume-builder">
              <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 font-bold uppercase tracking-wide border-4 border-foreground nb-button">
                Make Your Resume Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/templates">
              <Button size="lg" variant="outline" className="bg-background border-4 border-foreground text-foreground hover:bg-muted font-bold uppercase tracking-wide nb-button">
                Browse Templates
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-[hsl(var(--surface-dark))] py-20 md:py-28 text-white">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/[0.12] rounded-full blur-[140px]" />
      </div>

      <div className="container mx-auto px-4 max-w-5xl relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
          <Zap className="h-3.5 w-3.5" /> Start in Under 2 Minutes
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 leading-tight max-w-3xl mx-auto">
          Ready to Build a Resume That Gets You Hired?
        </h2>

        <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
          Join over 12,000+ candidates who transformed their career applications with MakeCV. 30+ ATS templates, AI writing assistance, and watermark-free PDF downloads.
        </p>

        {/* Dual Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link to="/resume-builder" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="rounded-full px-8 h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl w-full"
            >
              Make My Resume Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/templates" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 h-12 text-base font-medium border-white/20 text-white hover:bg-white/10 w-full"
            >
              Explore 30+ Templates
            </Button>
          </Link>
        </div>

        {/* Guarantees row */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-sm text-white/60">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 100% Free to Start
          </span>
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> ATS Compatibility Guaranteed
          </span>
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" /> No Credit Card Required
          </span>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
