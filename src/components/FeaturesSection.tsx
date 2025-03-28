
import { CheckCircle, Edit3, FileText, Layout, Shield, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    title: "Professional Templates",
    description: "Choose from dozens of ATS-optimized templates designed by hiring experts.",
    icon: Layout,
  },
  {
    title: "Easy Customization",
    description: "Personalize your resume with our drag-and-drop editor. No design skills needed.",
    icon: Edit3,
  },
  {
    title: "ATS-Friendly",
    description: "Our resumes are designed to pass applicant tracking systems used by employers.",
    icon: CheckCircle,
  },
  {
    title: "Multiple Formats",
    description: "Download your resume as PDF, DOCX, or TXT files to use anywhere.",
    icon: FileText,
  },
  {
    title: "Privacy Protected",
    description: "Your data is secure and never shared with third parties.",
    icon: Shield,
  },
  {
    title: "Quick & Easy",
    description: "Build and download your professional resume in less than 15 minutes.",
    icon: Zap,
  },
];

const FeaturesSection = () => {
  return (
    <section className="bg-muted py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to create the perfect resume
          </h2>
          <p className="mt-4 text-xl text-muted-foreground">
            Our intuitive resume builder has all the tools and features you need to create a professional, ATS-friendly resume.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card border-border">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
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
