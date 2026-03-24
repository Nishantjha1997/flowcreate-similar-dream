import { CheckCircle, Edit3, FileText, Layout, Shield, Zap, Award, Bot } from 'lucide-react';
import { useDesignMode } from '@/hooks/useDesignMode';

const features = [
  {
    title: "ATS-Optimized",
    description: "Templates designed to pass Applicant Tracking Systems and reach hiring managers.",
    icon: Layout,
    nbColor: "bg-[#3B82F6]"
  },
  {
    title: "AI Assistant",
    description: "Smart suggestions to improve your content and highlight achievements effectively.",
    icon: Bot,
    nbColor: "bg-[#A855F7]"
  },
  {
    title: "Easy Customization",
    description: "Personalize your resume with intuitive drag-and-drop. No design skills needed.",
    icon: Edit3,
    nbColor: "bg-[#22C55E]"
  },
  {
    title: "Expert Content",
    description: "Industry-specific suggestions written and approved by hiring managers.",
    icon: CheckCircle,
    nbColor: "bg-[#14B8A6]"
  },
  {
    title: "Multiple Formats",
    description: "Download as PDF, DOCX, or TXT to use with any application system.",
    icon: FileText,
    nbColor: "bg-[#F97316]"
  },
  {
    title: "Privacy Protected",
    description: "Your personal data is fully encrypted and never shared with third parties.",
    icon: Shield,
    nbColor: "bg-[#EF4444]"
  },
  {
    title: "Quick & Easy",
    description: "Build and download your professional resume in less than 15 minutes.",
    icon: Zap,
    nbColor: "bg-[#F59E0B]"
  },
  {
    title: "Achievement Focused",
    description: "Tools to help you quantify and showcase accomplishments that stand out.",
    icon: Award,
    nbColor: "bg-[#6366F1]"
  },
];

const FeaturesSection = () => {
  const { isNeoBrutalism } = useDesignMode();

  if (isNeoBrutalism) {
    return (
      <section className="py-24 bg-[#E0F2FE] border-y-[4px] border-foreground nb-pattern-dots">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-black tracking-tight text-foreground uppercase mb-4" style={{ textShadow: '3px 3px 0px hsl(var(--muted-foreground) / 0.3)' }}>
              Everything You Need
            </h2>
            <p className="text-xl text-foreground/80 font-mono">
              All the tools to help you get noticed by employers
            </p>
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

  // Apple-inspired features
  return (
    <section className="apple-section bg-section-alt">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-16 md:mb-20">
          <h2 className="apple-headline mb-5">
            Built for <span className="text-muted-foreground">impact.</span>
          </h2>
          <p className="apple-subheadline mx-auto">
            Everything you need to create a resume that gets you noticed.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group rounded-2xl bg-background p-7 transition-all duration-500 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors duration-500">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-base mb-2 tracking-apple-tight">
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
