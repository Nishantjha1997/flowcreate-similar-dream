import { useState, useRef } from 'react';
import { ArrowRight, CheckCircle2, Star, Upload, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useDesignMode } from '@/hooks/useDesignMode';
import { ResumeTemplatePreview } from '@/components/ResumeTemplatePreview';
import ScrollScene from '@/components/ScrollScene';
import { toast } from 'sonner';

const HeroSection = () => {
  const { isNeoBrutalism } = useDesignMode();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      toast.error('Please upload a PDF resume file.');
      return;
    }

    setIsUploading(true);
    toast.info('Loading resume builder with your file...');
    // Navigate to resume builder to process the file
    setTimeout(() => {
      navigate('/resume-builder');
    }, 600);
  };

  if (isNeoBrutalism) {
    return (
      <div className="relative overflow-hidden bg-[#FFE135] border-b-[6px] border-foreground">
        <div className="absolute inset-0 nb-pattern-grid opacity-30"></div>
        <div className="container mx-auto px-4 py-20 md:py-28 lg:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white font-mono text-xs uppercase font-bold mb-6">
              ⭐ 4.9/5 RATED BY 12,000+ JOB SEEKERS
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground uppercase mb-6">
              Only 2% of resumes win.<br />
              <span className="text-[#FF6B6B]" style={{ textShadow: '4px 4px 0px black' }}>
                Make yours one of them.
              </span>
            </h1>
            <p className="text-xl text-foreground/80 leading-relaxed font-mono mb-8 max-w-2xl mx-auto">
              Build an interview-ready, ATS-compliant resume in minutes. Choose from 30+ templates and export watermark-free PDFs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/resume-builder">
                <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 font-bold uppercase tracking-wide border-4 border-foreground nb-button">
                  Create My Resume <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={handleUploadClick}
                className="bg-background border-4 border-foreground text-foreground hover:bg-muted font-bold uppercase tracking-wide nb-button"
              >
                <Upload className="mr-2 h-5 w-5" /> Upload My Resume
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Resume.io & Apple-inspired dark hero — clean, trustworthy, high-converting
  return (
    <section className="relative overflow-hidden bg-[hsl(var(--surface-dark))]">
      <ScrollScene />
      
      {/* Background ambient lighting */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/[0.09] rounded-full blur-[130px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/[0.06] rounded-full blur-[110px]" />
      </div>

      <div className="container mx-auto px-4 pt-20 pb-16 md:pt-32 md:pb-24 lg:pt-36 lg:pb-28 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto">
          {/* Left Text Column */}
          <div className="w-full lg:w-[54%] text-center lg:text-left">
            {/* Social Proof Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] border border-white/10 text-white text-xs font-medium mb-6">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-amber-400" />
                ))}
              </div>
              <span className="text-white/80 font-semibold">4.9 / 5</span>
              <span className="text-white/40">·</span>
              <span className="text-white/60">12,400+ reviews</span>
            </div>

            {/* Main headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] text-white mb-6" style={{ letterSpacing: '-0.03em' }}>
              Only 2% of resumes win.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-primary">
                Make yours one of them.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-white/65 font-normal leading-relaxed mb-8 max-w-[38rem] lg:mx-0 mx-auto">
              Use recruiter-tested ATS templates, AI bullet improvements, and job-match keyword targeting to create a standout resume in 5 minutes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3.5 lg:justify-start justify-center mb-8">
              <Link to="/resume-builder" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="rounded-full px-8 h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-xl w-full"
                >
                  Create my resume
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleUploadClick}
                disabled={isUploading}
                className="rounded-full px-8 h-12 text-base font-medium border-white/20 text-white hover:bg-white/10 transition-all duration-300 w-full sm:w-auto"
              >
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? 'Loading...' : 'Upload existing resume'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Value Props Strip */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-white/60">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 39% higher interview callback rate
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 100% ATS formatted
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Free PDF export
              </span>
            </div>
          </div>

          {/* Right Showcase Column (Stack of interactive template previews with floating chips) */}
          <div className="w-full lg:w-[46%] flex justify-center items-center h-[360px] sm:h-[460px] relative overflow-visible mt-6 lg:mt-0">
            <div className="relative w-[300px] h-[340px] sm:w-[390px] sm:h-[440px] overflow-visible">
              {/* Left Card */}
              <div className="absolute left-0 top-12 w-[170px] sm:w-[230px] transform -rotate-12 transition-all duration-500 hover:rotate-0 hover:z-20 hover:scale-105">
                <ResumeTemplatePreview 
                  templateKey="split-frame" 
                  className="rounded-xl border border-white/10 shadow-2xl overflow-hidden aspect-[8.5/11]"
                />
              </div>
              
              {/* Right Card */}
              <div className="absolute right-0 top-12 w-[170px] sm:w-[230px] transform rotate-12 transition-all duration-500 hover:rotate-0 hover:z-20 hover:scale-105">
                <ResumeTemplatePreview 
                  templateKey="bold-headline" 
                  className="rounded-xl border border-white/10 shadow-2xl overflow-hidden aspect-[8.5/11]"
                />
              </div>
              
              {/* Center Card */}
              <div className="absolute left-1/2 top-4 -translate-x-1/2 w-[185px] sm:w-[245px] z-10 transform transition-all duration-500 hover:scale-105 hover:z-20">
                <ResumeTemplatePreview 
                  templateKey="modern" 
                  className="rounded-xl border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden aspect-[8.5/11]"
                />
              </div>

              {/* Floating ATS Score Badge */}
              <div className="absolute -bottom-2 -left-4 z-20 bg-background/95 text-foreground backdrop-blur-md border border-border/80 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                  98%
                </div>
                <div>
                  <div className="text-[11px] font-bold">ATS Score: Optimal</div>
                  <div className="text-[10px] text-muted-foreground">Parsed by Workday & Greenhouse</div>
                </div>
              </div>

              {/* Floating AI Polish Badge */}
              <div className="absolute -top-3 -right-3 z-20 bg-background/95 text-foreground backdrop-blur-md border border-border/80 rounded-2xl px-3.5 py-2 shadow-2xl flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-[11px] font-semibold">AI Tailored & Checked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Company Logos Trust Bar */}
        <div className="mt-20 md:mt-24 pt-10 border-t border-white/[0.08] text-center">
          <p className="text-[11px] font-semibold text-white/40 uppercase tracking-[0.2em] mb-6">
            Candidates built with MakeCV are hired by top employers worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14">
            {['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Adobe', 'Spotify', 'Tesla'].map((company) => (
              <span 
                key={company} 
                className="text-base sm:text-lg font-bold text-white/30 hover:text-white/60 transition-colors duration-300"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
