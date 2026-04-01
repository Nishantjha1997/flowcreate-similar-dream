import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useDesignMode } from '@/hooks/useDesignMode';

const HeroSection = () => {
  const { isNeoBrutalism } = useDesignMode();
  
  if (isNeoBrutalism) {
    return (
      <div className="relative overflow-hidden bg-[#FFE135] border-b-[6px] border-foreground">
        <div className="absolute inset-0 nb-pattern-grid opacity-30"></div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-[#FF6B6B] border-4 border-foreground rotate-12" style={{ boxShadow: '8px 8px 0px 0px black' }}></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-[#4ECDC4] border-4 border-foreground -rotate-6" style={{ boxShadow: '6px 6px 0px 0px black' }}></div>
        <div className="container mx-auto px-4 py-20 md:py-28 lg:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground uppercase mb-6">
              Build Resumes That
              <span className="block text-[#FF6B6B]" style={{ textShadow: '4px 4px 0px black' }}> Get You Hired</span>
            </h1>
            <p className="text-xl text-foreground/80 leading-relaxed font-mono mb-8 max-w-xl mx-auto">
              AI-powered resume builder with ATS optimization and expert-designed templates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/resume-builder">
                <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 font-bold uppercase tracking-wide border-4 border-foreground nb-button">
                  Create My Resume <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/templates">
                <Button size="lg" variant="outline" className="bg-background border-4 border-foreground text-foreground hover:bg-muted font-bold uppercase tracking-wide nb-button">
                  Browse Templates
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Apple-inspired dark hero — materialistic
  return (
    <section className="relative overflow-hidden bg-[hsl(var(--surface-dark))]">
      {/* Subtle gradient mesh */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/[0.08] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/[0.05] rounded-full blur-[100px]" />
      </div>

      {/* Fine grain texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
      }} />

      <div className="container mx-auto px-4 pt-24 pb-20 md:pt-36 md:pb-28 lg:pt-44 lg:pb-36 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Overline badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.1] mb-8 animate-apple-fade-in-up backdrop-blur-sm">
            <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/70 text-xs font-medium tracking-wide">AI-Powered Resume Builder</span>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-none text-white mb-6 animate-apple-fade-in-up-delay-1" style={{ letterSpacing: '-0.03em' }}>
            Your resume.{' '}
            <span className="text-white/40">Perfected.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/50 font-normal leading-relaxed mx-auto mb-12 max-w-[42rem] animate-apple-fade-in-up-delay-2">
            Create stunning, ATS-optimized resumes with intelligent AI suggestions. 
            Stand out to employers and land your dream job.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-apple-fade-in-up-delay-3">
            <Link to="/resume-builder">
              <Button 
                size="lg" 
                className="rounded-full px-8 h-12 text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-lg"
              >
                Start Building
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/templates">
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full px-8 h-12 text-base font-medium border-white/25 text-white/90 hover:bg-white/10 hover:text-white transition-all duration-300"
              >
                View Templates
              </Button>
            </Link>
          </div>

          {/* Trust indicators on dark */}
          <div className="mt-20 md:mt-24 animate-apple-fade-in-up-delay-3">
            <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-6">
              Trusted by professionals at
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              {['Google', 'Microsoft', 'Amazon', 'Adobe', 'Meta'].map((company) => (
                <span 
                  key={company} 
                  className="text-lg md:text-xl font-semibold text-white/[0.12] hover:text-white/[0.25] transition-colors duration-500"
                >
                  {company}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
