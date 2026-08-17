import { CheckCircle, Edit3, FileText, Layout, Shield, Zap, Award, Bot } from 'lucide-react';
import { useDesignMode } from '@/hooks/useDesignMode';

const features = [
  { title: "ATS-readable", description: "Clean hierarchy and proven layouts help your experience stay readable from upload to recruiter screen.", icon: Layout, nbColor: "bg-[#3B82F6]" },
  { title: "Role-aware AI", description: "Get focused rewrites that bring out impact, keywords, and evidence without inventing your story.", icon: Bot, nbColor: "bg-[#A855F7]" },
  { title: "Easy to shape", description: "Edit your story in a calm, guided builder with templates that do the visual heavy lifting.", icon: Edit3, nbColor: "bg-[#22C55E]" },
  { title: "Match guidance", description: "Compare your resume with a job description and see what to strengthen before you apply.", icon: CheckCircle, nbColor: "bg-[#14B8A6]" },
  { title: "One-click export", description: "Download PDF, DOCX, or TXT versions ready for the application system in front of you.", icon: FileText, nbColor: "bg-[#F97316]" },
  { title: "Private by design", description: "Your career story stays in your account and is never used as public content without your action.", icon: Shield, nbColor: "bg-[#EF4444]" },
  { title: "Fast first draft", description: "Go from blank page to a polished foundation in minutes, not a weekend of formatting.", icon: Zap, nbColor: "bg-[#F59E0B]" },
  { title: "Impact first", description: "Turn responsibilities into clear accomplishments with stronger verbs and meaningful outcomes.", icon: Award, nbColor: "bg-[#6366F1]" },
];

const FeaturesSection = () => {
  const { isNeoBrutalism } = useDesignMode();

  if (isNeoBrutalism) {
    return (
      <section className="py-24 bg-[#E0F2FE] dark:bg-sky-950 border-y-[4px] border-foreground nb-pattern-dots">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-black tracking-tight text-foreground uppercase mb-4" style={{ textShadow: '3px 3px 0px hsl(var(--muted-foreground) / 0.3)' }}>
              Everything You Need
            </h2>
            <p className="text-xl text-foreground/80 font-mono">All the tools to help you get noticed by employers</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={index} className="bg-background border-[3px] border-foreground p-6 nb-card group">
                <div className={`h-14 w-14 ${feature.nbColor} border-[3px] border-foreground flex items-center justify-center mb-4 nb-shadow-sm group-hover:animate-nb-bounce`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-lg uppercase tracking-wide mb-2">{feature.title}</h3>
                <p className="text-muted-foreground font-mono text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Materialistic Apple — elevated grey cards on light surface
  return (
    <section className="apple-section bg-[hsl(var(--surface-elevated))]">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-16 md:mb-20">
          <h2 className="apple-headline mb-5">
            Built for <span className="text-muted-foreground">impact.</span>
          </h2>
          <p className="apple-subheadline mx-auto">
            Everything you need to make the next application count.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group rounded-2xl bg-background p-7 transition-all duration-500 hover:shadow-lg hover:-translate-y-1 border border-border/40"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)' }}
            >
              <div className="h-10 w-10 rounded-xl bg-[hsl(var(--surface-dark))] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500">
                <feature.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-foreground text-base mb-2 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
