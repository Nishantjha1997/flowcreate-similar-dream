import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDesignMode } from '@/hooks/useDesignMode';

const CallToAction = () => {
  const [isIndianUser, setIsIndianUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isNeoBrutalism } = useDesignMode();

  useEffect(() => {
    const detectLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        setIsIndianUser(data.country_code === 'IN');
      } catch {
        setIsIndianUser(false);
      } finally {
        setLoading(false);
      }
    };
    detectLocation();
  }, []);

  const plans = [
    { name: "Free", price: isIndianUser ? "₹0" : "$0", description: "Perfect for getting started", features: ["1 resume template", "Basic customization", "PDF download", "Email support"], popular: false },
    { name: "Pro", price: isIndianUser ? "₹199" : "$2.99", period: "/mo", description: "Everything for job hunting", features: ["All premium templates", "AI-powered suggestions", "Multiple formats", "Priority support", "Cover letter builder", "ATS optimization"], popular: true },
    { name: "Annual", price: isIndianUser ? "₹1,999" : "$19.99", period: "/yr", description: "Best value — save 44%", features: ["Everything in Pro", "2 months free", "Priority support", "Advanced features", "Version history"], popular: false },
    { name: "Lifetime", price: isIndianUser ? "₹2,500" : "$29.99", description: "One-time payment", features: ["Everything in Pro", "Future template updates", "Advanced customization", "Portfolio builder", "Interview prep", "Lifetime updates"], popular: false }
  ];

  if (loading) {
    return (
      <section className="apple-section bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="h-10 w-48 mx-auto rounded-lg bg-muted animate-pulse mb-4" />
            <div className="h-5 w-72 mx-auto rounded-lg bg-muted animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (isNeoBrutalism) {
    return (
      <section className="py-24 bg-background">
        <div className="absolute inset-0 nb-pattern-grid opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black uppercase text-foreground mb-4">Choose Your Plan</h2>
            <p className="text-xl font-medium text-foreground">Start free, upgrade when you're ready</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <div key={index} className={`relative bg-background border-3 border-foreground p-6 nb-card ${plan.popular ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}`}>
                {plan.popular && <div className="absolute top-0 right-0 px-3 py-1 text-xs bg-foreground text-background font-bold uppercase">Popular</div>}
                <h3 className="text-xl font-black uppercase mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground font-mono mb-3">{plan.description}</p>
                <div className="text-3xl font-black mb-4">{plan.price}{plan.period && <span className="text-base font-bold">{plan.period}</span>}</div>
                <ul className="space-y-2 mb-6">{plan.features.map((f, i) => (<li key={i} className="flex items-center text-sm"><Check className="h-4 w-4 mr-2 flex-shrink-0" />{f}</li>))}</ul>
                <Link to="/register"><Button className="w-full rounded-none border-2 border-foreground font-bold uppercase shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all" variant={plan.popular ? 'default' : 'outline'}>Get Started</Button></Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Materialistic Apple pricing — light section with elevated cards
  return (
    <section className="apple-section bg-[hsl(var(--surface-elevated))]">
      <div className="container mx-auto px-4">
        {/* Stats row — dark inset cards */}
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4 mb-20 md:mb-24">
          {[
            { value: '2M+', label: 'Resumes Created' },
            { value: '95%', label: 'Success Rate' },
            { value: '24/7', label: 'Expert Support' }
          ].map(({ value, label }) => (
            <div key={label} className="text-center rounded-2xl bg-[hsl(var(--surface-dark))] py-8 px-4">
              <div className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-1">{value}</div>
              <div className="text-xs text-white/50">{label}</div>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="max-w-2xl mx-auto text-center mb-14">
          <h2 className="apple-headline mb-5">
            Find the plan <span className="text-muted-foreground">that's right for you.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative rounded-2xl p-6 transition-all duration-500 ${
                plan.popular 
                  ? 'bg-[hsl(var(--surface-dark))] text-white ring-1 ring-white/10 shadow-2xl scale-[1.02]' 
                  : 'bg-background ring-1 ring-border/50 hover:shadow-lg hover:-translate-y-1'
              }`}
              style={!plan.popular ? { boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)' } : undefined}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  Most Popular
                </div>
              )}
              <div className="mb-5">
                <h3 className={`text-lg font-semibold tracking-tight mb-1 ${plan.popular ? 'text-white' : 'text-foreground'}`}>
                  {plan.name}
                </h3>
                <p className={`text-xs ${plan.popular ? 'text-white/50' : 'text-muted-foreground'}`}>
                  {plan.description}
                </p>
              </div>
              <div className={`text-3xl font-semibold tracking-tight mb-6 ${plan.popular ? 'text-white' : 'text-foreground'}`}>
                {plan.price}
                {plan.period && <span className={`text-sm font-normal ${plan.popular ? 'text-white/50' : 'text-muted-foreground'}`}>{plan.period}</span>}
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2.5">
                    <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${plan.popular ? 'text-primary' : 'text-primary'}`} />
                    <span className={`text-sm ${plan.popular ? 'text-white/70' : 'text-muted-foreground'}`}>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <Button 
                  className={`w-full rounded-full h-10 text-sm font-medium transition-all duration-300 ${
                    plan.popular 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : 'bg-transparent border border-border text-foreground hover:bg-muted'
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  Get Started
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Final CTA — dark band */}
        <div className="mt-20 md:mt-24 rounded-3xl bg-[hsl(var(--surface-dark))] p-12 md:p-16 text-center">
          <h3 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-4">
            Ready to build your perfect resume?
          </h3>
          <p className="text-white/50 mb-8 max-w-md mx-auto">
            Join millions of professionals who've landed their dream jobs.
          </p>
          <Link to="/resume-builder">
            <Button 
              size="lg" 
              className="rounded-full px-8 h-12 text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-lg"
            >
              Start Building Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
