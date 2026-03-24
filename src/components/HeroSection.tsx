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

  // Apple-inspired hero
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 pt-20 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Overline */}
          <p className="text-primary font-medium text-sm md:text-base mb-4 animate-apple-fade-in-up tracking-wide">
            AI-Powered Resume Builder
          </p>

          {/* Main headline — Apple style large centered text */}
          <h1 className="apple-headline-lg mb-6 animate-apple-fade-in-up-delay-1 text-balance">
            Your resume.{' '}
            <span className="text-muted-foreground">Perfected.</span>
          </h1>

          {/* Subheadline */}
          <p className="apple-subheadline mx-auto mb-10 animate-apple-fade-in-up-delay-2">
            Create stunning, ATS-optimized resumes with intelligent AI suggestions. 
            Stand out to employers and land your dream job.
          </p>

          {/* CTA Buttons — Apple pill style */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-apple-fade-in-up-delay-3">
            <Link to="/resume-builder">
              <Button 
                size="lg" 
                className="rounded-full px-8 h-12 text-base font-normal bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-none"
              >
                Start Building
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/templates">
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full px-8 h-12 text-base font-normal border-border/60 text-primary hover:bg-primary/5 transition-all duration-300"
              >
                View Templates
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 md:mt-20 animate-apple-fade-in-up-delay-3">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">
              Trusted by professionals at
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              {['Google', 'Microsoft', 'Amazon', 'Adobe', 'Meta'].map((company) => (
                <span 
                  key={company} 
                  className="text-lg md:text-xl font-semibold text-foreground/20 hover:text-foreground/40 transition-colors duration-500"
                >
                  {company}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle gradient orb for depth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/[0.03] rounded-full blur-3xl pointer-events-none" />
    </section>
  );
};

export default HeroSection;
