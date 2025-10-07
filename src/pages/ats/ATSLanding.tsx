import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Users, Target, TrendingUp, Clock, BarChart3, 
  Shield, Zap, MessageSquare, Award, CheckCircle2 
} from 'lucide-react';

const ATSLanding = () => {
  const features = [
    {
      icon: <Users className="h-12 w-12 text-primary" />,
      title: "Collaborative Hiring",
      description: "Real-time collaboration with your entire hiring team. Review, comment, and make decisions together seamlessly."
    },
    {
      icon: <Target className="h-12 w-12 text-primary" />,
      title: "AI-Powered Matching",
      description: "Intelligent resume parsing and candidate-job matching using advanced AI to find the perfect fit."
    },
    {
      icon: <TrendingUp className="h-12 w-12 text-primary" />,
      title: "Custom Pipelines",
      description: "Design your hiring workflow with custom stages, automated actions, and flexible kanban boards."
    },
    {
      icon: <Clock className="h-12 w-12 text-primary" />,
      title: "Interview Scheduling",
      description: "Streamlined interview coordination with calendar integration and automated reminders."
    },
    {
      icon: <BarChart3 className="h-12 w-12 text-primary" />,
      title: "Advanced Analytics",
      description: "Deep insights into your hiring metrics, time-to-hire, source effectiveness, and team performance."
    },
    {
      icon: <Shield className="h-12 w-12 text-primary" />,
      title: "Enterprise Security",
      description: "Bank-level encryption, role-based access control, and full GDPR compliance."
    }
  ];

  const painPoints = [
    {
      problem: "Scattered Communication",
      solution: "Centralized candidate communication history with @mentions and real-time notifications"
    },
    {
      problem: "Manual Resume Screening",
      solution: "AI-powered resume parsing and automated candidate ranking based on job requirements"
    },
    {
      problem: "Poor Collaboration",
      solution: "Real-time collaborative review system with structured feedback and voting"
    },
    {
      problem: "Limited Insights",
      solution: "Comprehensive analytics dashboard with customizable reports and export options"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">For HR Teams & Organizations</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Hire Smarter, Faster, Together
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The modern ATS platform built for collaborative hiring. Streamline your recruitment, 
              make data-driven decisions, and build winning teams.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/ats/login">
                <Button size="lg" className="text-lg px-8">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/ats/demo">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Watch Demo
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">10x</div>
                <div className="text-sm text-muted-foreground">Faster Screening</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">95%</div>
                <div className="text-sm text-muted-foreground">Time Saved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">50%</div>
                <div className="text-sm text-muted-foreground">Better Hires</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Hire Successfully</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to solve real hiring challenges
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-background p-8 rounded-xl border border-border hover:border-primary/50 transition-all hover:shadow-lg"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Built to Solve Your Biggest Hiring Challenges</h2>
            <p className="text-xl text-muted-foreground">
              We understand the problems you face. Here's how we solve them.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-6">
            {painPoints.map((item, index) => (
              <div 
                key={index}
                className="bg-background p-6 rounded-lg border border-border flex items-start gap-4"
              >
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    <span className="text-muted-foreground line-through">{item.problem}</span>
                    <span className="mx-2">→</span>
                    <span className="text-primary">{item.solution}</span>
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by Growing Teams</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-background p-8 rounded-xl border border-border">
              <Award className="h-12 w-12 text-primary mb-4" />
              <p className="text-muted-foreground mb-4">
                "FlowCreate ATS transformed our hiring. We reduced time-to-hire by 60% and our team collaboration has never been better."
              </p>
              <div className="font-semibold">Sarah Johnson</div>
              <div className="text-sm text-muted-foreground">Head of HR, TechCorp</div>
            </div>
            
            <div className="bg-background p-8 rounded-xl border border-border">
              <Award className="h-12 w-12 text-primary mb-4" />
              <p className="text-muted-foreground mb-4">
                "The AI-powered matching is incredible. We're finding candidates that perfectly fit our requirements in minutes, not days."
              </p>
              <div className="font-semibold">Michael Chen</div>
              <div className="text-sm text-muted-foreground">Talent Director, StartupXYZ</div>
            </div>
            
            <div className="bg-background p-8 rounded-xl border border-border">
              <Award className="h-12 w-12 text-primary mb-4" />
              <p className="text-muted-foreground mb-4">
                "Finally, an ATS that doesn't feel like it's stuck in 2010. Modern, intuitive, and powerful. Love it!"
              </p>
              <div className="font-semibold">Emily Rodriguez</div>
              <div className="text-sm text-muted-foreground">Recruiting Manager, GrowthCo</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Hiring?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of teams hiring smarter with FlowCreate ATS
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link to="/ats/login">
                <Button size="lg" className="text-lg px-8">
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/ats/contact">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Talk to Sales
                </Button>
              </Link>
            </div>
            
            <p className="text-sm text-muted-foreground">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ATSLanding;