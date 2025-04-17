
import { CheckCircle, Edit3, FileText, Layout, Shield, Zap, Award, Bot, Sparkles, Code, Brain } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    title: "AI Resume Assistant",
    description: "Get smart suggestions powered by Gemini AI to improve your content and highlight your achievements effectively.",
    icon: Sparkles,
    color: "bg-purple-100 text-purple-600"
  },
  {
    title: "ATS-Optimized Templates",
    description: "Our templates are designed to pass through Applicant Tracking Systems and get your resume into human hands.",
    icon: Layout,
    color: "bg-blue-100 text-blue-600"
  },
  {
    title: "Smart Job Title Suggestions",
    description: "AI analyzes your job descriptions and suggests the most impactful job titles for your experience.",
    icon: Brain,
    color: "bg-indigo-100 text-indigo-600"
  },
  {
    title: "Easy Customization",
    description: "Personalize your resume with our intuitive drag-and-drop editor. No design skills needed.",
    icon: Edit3,
    color: "bg-green-100 text-green-600"
  },
  {
    title: "Skills Generator",
    description: "AI-powered tool automatically suggests relevant skills based on your work experience and job titles.",
    icon: Bot,
    color: "bg-amber-100 text-amber-600"
  },
  {
    title: "Expert-Approved Content",
    description: "Use industry-specific content suggestions written and approved by hiring managers.",
    icon: CheckCircle, 
    color: "bg-teal-100 text-teal-600"
  },
  {
    title: "Achievement Enhancer",
    description: "Turn bland job descriptions into powerful achievement statements with our AI assistant.",
    icon: Award,
    color: "bg-red-100 text-red-600"
  },
  {
    title: "Multiple Formats",
    description: "Download your resume as PDF, DOCX, or TXT files to use with any application system.",
    icon: FileText,
    color: "bg-orange-100 text-orange-600"
  },
  {
    title: "Technical Skills Detector",
    description: "AI detects and highlights technical skills from your experience for tech-focused resumes.",
    icon: Code,
    color: "bg-emerald-100 text-emerald-600"
  },
  {
    title: "Privacy Protected",
    description: "Your personal data is fully encrypted and never shared with third parties.",
    icon: Shield,
    color: "bg-sky-100 text-sky-600"
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            AI-Powered Resume Creation
          </h2>
          <p className="mt-4 text-xl text-muted-foreground">
            Our intuitive resume builder with Gemini AI has all the tools to help you get noticed by employers
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {features.slice(0, 5).map((feature, index) => (
            <Card key={index} className={`border hover:shadow-md transition-all duration-300 h-full ${index === 0 ? 'lg:col-span-2 xl:col-span-2' : ''}`}>
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
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mt-8">
          {features.slice(5).map((feature, index) => (
            <Card key={index + 5} className="border hover:shadow-md transition-all duration-300 h-full">
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
