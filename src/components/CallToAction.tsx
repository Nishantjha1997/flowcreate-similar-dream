
import { ArrowRight, Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for getting started",
      features: [
        "1 resume template",
        "Basic customization",
        "PDF download",
        "Email support"
      ],
      popular: false
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "/month",
      description: "Everything you need for job hunting",
      features: [
        "All premium templates",
        "AI-powered suggestions",
        "Multiple formats (PDF, DOCX)",
        "Priority support",
        "Cover letter builder",
        "ATS optimization"
      ],
      popular: true
    },
    {
      name: "Lifetime",
      price: "$49.99",
      description: "One-time payment, lifetime access",
      features: [
        "Everything in Pro",
        "Future template updates",
        "Advanced customization",
        "Portfolio builder",
        "Interview preparation"
      ],
      popular: false
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* About Section */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-6">
            About Our Resume Builder
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            We understand that creating a professional resume can be challenging. That's why we've built a platform that combines cutting-edge AI technology with expert-designed templates to help you create resumes that get noticed by hiring managers and pass through ATS systems.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center p-6 bg-background/60 backdrop-blur-sm rounded-xl border border-border/50">
              <div className="text-3xl font-bold text-primary mb-2">2M+</div>
              <div className="text-muted-foreground">Resumes Created</div>
            </div>
            <div className="text-center p-6 bg-background/60 backdrop-blur-sm rounded-xl border border-border/50">
              <div className="text-3xl font-bold text-primary mb-2">95%</div>
              <div className="text-muted-foreground">User Success Rate</div>
            </div>
            <div className="text-center p-6 bg-background/60 backdrop-blur-sm rounded-xl border border-border/50">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Expert Support</div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-muted-foreground">
              Start free, upgrade when you're ready
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${plan.popular ? 'border-primary shadow-lg scale-105' : 'hover:scale-105'} bg-background/60 backdrop-blur-sm`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm font-medium">
                    <Star className="inline h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="text-3xl font-bold">
                    {plan.price}
                    {plan.period && <span className="text-lg text-muted-foreground">{plan.period}</span>}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/register">
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="max-w-4xl mx-auto text-center mt-20 p-8 bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm rounded-2xl border border-border/50">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Ready to Create Your Professional Resume?
          </h3>
          <p className="text-muted-foreground mb-6">
            Join millions of professionals who have successfully landed their dream jobs with our resume builder.
          </p>
          <Link to="/resume-builder">
            <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg">
              Start Building Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
