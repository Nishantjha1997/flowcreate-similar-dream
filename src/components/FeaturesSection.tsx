import { CheckCircle, Edit3, FileText, Layout, Shield, Zap, Award, Bot } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDesignMode } from '@/hooks/useDesignMode';

const features = [
  {
    title: "ATS-Optimized Templates",
    description: "Our templates are designed to pass through Applicant Tracking Systems and get your resume into human hands.",
    icon: Layout,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    nbColor: "bg-[#3B82F6]"
  },
  {
    title: "AI Resume Assistant",
    description: "Get smart suggestions to improve your content and highlight your achievements effectively.",
    icon: Bot,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    nbColor: "bg-[#A855F7]"
  },
  {
    title: "Easy Customization",
    description: "Personalize your resume with our intuitive drag-and-drop editor. No design skills needed.",
    icon: Edit3,
    color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    nbColor: "bg-[#22C55E]"
  },
  {
    title: "Expert-Approved Content",
    description: "Use industry-specific content suggestions written and approved by hiring managers.",
    icon: CheckCircle, 
    color: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400",
    nbColor: "bg-[#14B8A6]"
  },
  {
    title: "Multiple Formats",
    description: "Download your resume as PDF, DOCX, or TXT files to use with any application system.",
    icon: FileText,
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    nbColor: "bg-[#F97316]"
  },
  {
    title: "Privacy Protected",
    description: "Your personal data is fully encrypted and never shared with third parties.",
    icon: Shield,
    color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    nbColor: "bg-[#EF4444]"
  },
  {
    title: "Quick & Easy",
    description: "Build and download your professional resume in less than 15 minutes.",
    icon: Zap,
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    nbColor: "bg-[#F59E0B]"
  },
  {
    title: "Achievement Focused",
    description: "Tools to help you quantify and showcase your accomplishments to stand out.",
    icon: Award,
    color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
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
              Everything You Need for Job-Winning Resumes
            </h2>
            <p className="text-xl text-foreground/80 font-mono">
              Our intuitive resume builder has all the tools to help you get noticed by employers
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-background border-[3px] border-foreground p-6 nb-card group"
              >
                <div className={`h-14 w-14 ${feature.nbColor} border-[3px] border-foreground flex items-center justify-center mb-4 nb-shadow-sm group-hover:animate-nb-bounce`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-lg uppercase tracking-wide mb-2">{feature.title}</h3>
                <p className="text-muted-foreground font-mono text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Default modern design
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything You Need for Job-Winning Resumes
          </h2>
          <p className="mt-4 text-xl text-muted-foreground">
            Our intuitive resume builder has all the tools to help you get noticed by employers
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="border hover:shadow-md transition-all duration-300 h-full">
              <CardHeader>
                <div className={`h-12 w-12 rounded-full ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;