
import { ArrowRight, Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDesignMode } from '@/hooks/useDesignMode';

const CallToAction = () => {
  const [isIndianUser, setIsIndianUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isNeoBrutalism } = useDesignMode();

  useEffect(() => {
    // Detect user location
    const detectLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        setIsIndianUser(data.country_code === 'IN');
      } catch (error) {
        // Default to USD if detection fails
        setIsIndianUser(false);
      } finally {
        setLoading(false);
      }
    };

    detectLocation();
  }, []);

  const plans = [
    {
      name: "Free",
      price: isIndianUser ? "₹0" : "$0",
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
      price: isIndianUser ? "₹199" : "$2.99",
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
      name: "Yearly",
      price: isIndianUser ? "₹1,999" : "$19.99",
      period: "/year",
      description: "Annual plan with great savings",
      features: [
        "Everything in Pro",
        "2 months free",
        "Priority support",
        "Advanced features",
        "Version history"
      ],
      popular: false
    },
    {
      name: "Lifetime",
      price: isIndianUser ? "₹2,500" : "$29.99",
      description: "One-time payment, lifetime access",
      features: [
        "Everything in Pro",
        "Future template updates",
        "Advanced customization",
        "Portfolio builder",
        "Interview preparation",
        "Lifetime updates"
      ],
      popular: false
    }
  ];

  if (loading) {
    return (
      <section className={`py-24 relative overflow-hidden ${
        isNeoBrutalism 
          ? 'bg-background' 
          : 'bg-gradient-to-b from-background to-muted/30'
      }`}>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-pulse">
              <div className={`h-8 rounded mb-4 ${isNeoBrutalism ? 'bg-foreground/20' : 'bg-gray-300'}`}></div>
              <div className={`h-4 rounded mb-8 ${isNeoBrutalism ? 'bg-foreground/20' : 'bg-gray-300'}`}></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-24 relative overflow-hidden ${
      isNeoBrutalism 
        ? 'bg-background' 
        : 'bg-gradient-to-b from-background to-muted/30'
    }`}>
      {/* Background elements */}
      {isNeoBrutalism ? (
        <div className="absolute inset-0 nb-pattern-grid opacity-30"></div>
      ) : (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
        </div>
      )}

      <div className="container mx-auto px-4 relative z-10">
        {/* About Section */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className={`tracking-tight mb-6 ${
            isNeoBrutalism 
              ? 'text-4xl sm:text-5xl font-black uppercase text-foreground' 
              : 'text-3xl font-bold text-foreground sm:text-4xl'
          }`}>
            About Our Resume Builder
          </h2>
          <p className={`text-xl leading-relaxed mb-8 ${
            isNeoBrutalism ? 'text-foreground font-medium' : 'text-muted-foreground'
          }`}>
            We understand that creating a professional resume can be challenging. That's why we've built a platform that combines cutting-edge AI technology with expert-designed templates to help you create resumes that get noticed by hiring managers and pass through ATS systems.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              { value: '2M+', label: 'Resumes Created' },
              { value: '95%', label: 'User Success Rate' },
              { value: '24/7', label: 'Expert Support' }
            ].map(({ value, label }) => (
              <div 
                key={label}
                className={`text-center p-6 ${
                  isNeoBrutalism 
                    ? 'bg-primary/10 border-3 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]' 
                    : 'bg-background/60 backdrop-blur-sm rounded-xl border border-border/50'
                }`}
              >
                <div className={`text-3xl mb-2 ${
                  isNeoBrutalism ? 'font-black text-primary uppercase' : 'font-bold text-primary'
                }`}>{value}</div>
                <div className={isNeoBrutalism ? 'font-bold uppercase tracking-wide text-foreground' : 'text-muted-foreground'}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Section */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`tracking-tight mb-4 ${
              isNeoBrutalism 
                ? 'text-4xl sm:text-5xl font-black uppercase text-foreground' 
                : 'text-3xl font-bold text-foreground sm:text-4xl'
            }`}>
              Choose Your Plan
            </h2>
            <p className={`text-xl ${isNeoBrutalism ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
              Start free, upgrade when you're ready
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative overflow-hidden transition-all duration-300 ${
                  isNeoBrutalism 
                    ? `border-3 border-foreground ${plan.popular ? 'bg-yellow-100 dark:bg-yellow-900/30 shadow-[6px_6px_0px_0px_hsl(var(--foreground))]' : 'shadow-[4px_4px_0px_0px_hsl(var(--foreground))]'} hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_hsl(var(--foreground))]` 
                    : `${plan.popular ? 'border-primary shadow-lg scale-105' : 'hover:scale-105 hover:shadow-lg'} bg-background/60 backdrop-blur-sm`
                }`}
              >
                {plan.popular && (
                  <div className={`absolute top-0 right-0 px-3 py-1 text-sm font-medium ${
                    isNeoBrutalism 
                      ? 'bg-foreground text-background font-bold uppercase' 
                      : 'bg-primary text-primary-foreground'
                  }`}>
                    <Star className="inline h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className={`text-2xl ${isNeoBrutalism ? 'font-black uppercase' : ''}`}>
                    {plan.name}
                  </CardTitle>
                  <CardDescription className={isNeoBrutalism ? 'font-medium text-foreground/70' : ''}>
                    {plan.description}
                  </CardDescription>
                  <div className={`text-3xl ${isNeoBrutalism ? 'font-black' : 'font-bold'}`}>
                    {plan.price}
                    {plan.period && <span className={`text-lg ${isNeoBrutalism ? 'font-bold' : 'text-muted-foreground'}`}>{plan.period}</span>}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className={`h-4 w-4 mr-3 flex-shrink-0 ${
                          isNeoBrutalism ? 'text-foreground' : 'text-primary'
                        }`} />
                        <span className={`text-sm ${isNeoBrutalism ? 'font-medium' : ''}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/register">
                    <Button 
                      className={`w-full ${
                        isNeoBrutalism 
                          ? 'rounded-none border-2 border-foreground font-bold uppercase shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all' 
                          : plan.popular ? 'bg-primary hover:bg-primary/90' : ''
                      }`}
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
        <div className={`max-w-4xl mx-auto text-center mt-20 p-8 ${
          isNeoBrutalism 
            ? 'bg-primary/20 border-3 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))]' 
            : 'bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm rounded-2xl border border-border/50'
        }`}>
          <h3 className={`mb-4 ${
            isNeoBrutalism 
              ? 'text-2xl font-black uppercase text-foreground' 
              : 'text-2xl font-bold text-foreground'
          }`}>
            Ready to Create Your Professional Resume?
          </h3>
          <p className={`mb-6 ${isNeoBrutalism ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
            Join millions of professionals who have successfully landed their dream jobs with our resume builder.
          </p>
          <Link to="/resume-builder">
            <Button 
              size="lg" 
              className={`${
                isNeoBrutalism 
                  ? 'rounded-none border-3 border-foreground font-bold uppercase shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-lg px-8' 
                  : 'bg-primary hover:bg-primary/90 shadow-lg'
              }`}
            >
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
