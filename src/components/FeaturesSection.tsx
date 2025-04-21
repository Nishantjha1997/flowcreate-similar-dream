
import { CheckCircle, Edit3, FileText, Layout, Shield, Zap, Award, Bot } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    title: "ATS-Optimized Templates",
    description: "Our templates are designed to pass through Applicant Tracking Systems and get your resume into human hands.",
    icon: Layout,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
  },
  {
    title: "AI Resume Assistant",
    description: "Get smart suggestions to improve your content and highlight your achievements effectively.",
    icon: Bot,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
  },
  {
    title: "Easy Customization",
    description: "Personalize your resume with our intuitive drag-and-drop editor. No design skills needed.",
    icon: Edit3,
    color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
  },
  {
    title: "Expert-Approved Content",
    description: "Use industry-specific content suggestions written and approved by hiring managers.",
    icon: CheckCircle, 
    color: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"
  },
  {
    title: "Multiple Formats",
    description: "Download your resume as PDF, DOCX, or TXT files to use with any application system.",
    icon: FileText,
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
  },
  {
    title: "Privacy Protected",
    description: "Your personal data is fully encrypted and never shared with third parties.",
    icon: Shield,
    color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
  },
  {
    title: "Quick & Easy",
    description: "Build and download your professional resume in less than 15 minutes.",
    icon: Zap,
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
  },
  {
    title: "Achievement Focused",
    description: "Tools to help you quantify and showcase your accomplishments to stand out.",
    icon: Award,
    color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
  },
];

const FeaturesSection = () => {
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
