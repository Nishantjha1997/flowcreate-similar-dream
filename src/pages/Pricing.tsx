import Header from '@/components/Header';
import { ScrollReveal } from '@/hooks/useScrollAnimation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle2, HelpCircle, ArrowRight, Sparkles, Zap, ShieldCheck, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PremiumUpgradeButton } from '@/components/PremiumUpgradeButton';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { usePageMeta } from '@/hooks/usePageMeta';

const FALLBACK_PLANS = [
  {
    id: 'free',
    name: 'Free Forever',
    slug: 'free',
    description: 'Perfect for building your first professional resume.',
    price_inr: 0,
    price_usd: 0,
    billing_interval: 'free',
    features: [
      'All 30+ ATS templates',
      'Real-time live preview',
      'Instant PDF export',
      'Save 1 master resume',
      'Job description keyword scan',
      '❌ Unlimited resumes',
      '❌ AI Writing Assistant quota',
      '❌ AI Job Match tailor',
    ],
  },
  {
    id: 'monthly',
    name: 'Monthly Pro',
    slug: 'monthly',
    description: 'Active job seekers applying to multiple positions.',
    price_inr: 29900,
    price_usd: 500,
    billing_interval: 'month',
    features: [
      'Everything in Free',
      'Unlimited resumes & versions',
      '100 AI actions / 30 days',
      'AI Bullet point polish',
      'AI Job Match Analyzer',
      'Matching cover letter suite',
      'Cloud backup & sharing link',
    ],
  },
  {
    id: 'yearly',
    name: 'Yearly Career Plus',
    slug: 'yearly',
    description: 'Best value for professionals accelerating their careers.',
    price_inr: 249900,
    price_usd: 3900,
    billing_interval: 'year',
    features: [
      'Everything in Monthly',
      '150 AI actions / 30 days',
      'Save 35% vs monthly billing',
      'Multi-language translation',
      'Priority ATS scanning engine',
      'Priority customer support',
      'Lifetime template updates',
    ],
  },
  {
    id: 'lifetime',
    name: 'Lifetime Access',
    slug: 'lifetime',
    description: 'One-time payment for permanent, perpetual access.',
    price_inr: 499900,
    price_usd: 7900,
    billing_interval: 'lifetime',
    features: [
      'Everything in Yearly',
      '150 AI actions / 30 days forever',
      'No recurring subscriptions',
      'All future AI features included',
      'Dedicated VIP support',
      'Unlimited master profiles',
    ],
  },
];

const formatPrice = (amount: number, isINR: boolean) => {
  if (amount === 0) return 'Free';
  if (isINR) {
    const value = Math.floor(amount / 100);
    return '₹' + value.toLocaleString('en-IN');
  } else {
    const value = amount / 100;
    return '$' + value.toFixed(2);
  }
};

const getIntervalText = (interval: string) => {
  switch (interval) {
    case 'month': return '/month';
    case 'year': return '/year (billed annually)';
    case 'lifetime': return 'one-time';
    case 'free': return 'forever';
    default: return '';
  }
};

const Pricing = () => {
  usePageMeta({
    title: 'Pricing — Free & Pro Resume Builder Plans | MakeCV',
    description: 'MakeCV is free forever. Upgrade for unlimited resumes, AI bullet polishing, and cover letters. Transparent plans, no surprise subscriptions or hidden fees.',
  });

  useEffect(() => {
    const faqScript = document.createElement('script');
    faqScript.type = 'application/ld+json';
    faqScript.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is MakeCV really free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. MakeCV offers a free plan that lets you create, customize with 30+ ATS templates, and download your recruiter-ready PDF without requiring a credit card.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I cancel my subscription anytime?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, you can cancel anytime with one click in your account settings with no questions asked.',
          },
        },
        {
          '@type': 'Question',
          name: 'What are AI actions and how do they work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'AI actions power intelligent bullet point rewriting, job match analysis, cover letter generation, and translation. Monthly allowances reset every 30 days automatically.',
          },
        },
      ],
    });
    faqScript.id = 'faq-schema';
    document.head.appendChild(faqScript);
    return () => {
      const el = document.getElementById('faq-schema');
      if (el) document.head.removeChild(el);
    };
  }, []);

  const { user } = useAuth();
  const [isIndianUser, setIsIndianUser] = useState(false);
  const [loading, setLoading] = useState(true);

  const { data: dbPlans, isLoading: loadingPlans } = useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('product', 'resume')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const detectLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        setIsIndianUser(data.country_code === 'IN');
      } catch (error) {
        setIsIndianUser(false);
      } finally {
        setLoading(false);
      }
    };
    detectLocation();
  }, []);

  if (loading || loadingPlans) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-20">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-muted rounded-full w-48 mx-auto" />
              <div className="h-12 bg-muted rounded-lg w-3/4 mx-auto" />
              <div className="h-6 bg-muted rounded w-1/2 mx-auto" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const plans = dbPlans && dbPlans.length > 0 ? dbPlans : FALLBACK_PLANS;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
                <Zap className="h-3.5 w-3.5" /> Simple, Transparent Pricing
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-5">
                Invest in Your Career with Confidence
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Start for free with zero credit card required. Upgrade when you need unlimited resumes and advanced AI tools.
              </p>
            </div>
          </ScrollReveal>

          {/* Pricing Grid */}
          <ScrollReveal delay={100}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-20 items-stretch">
              {plans.map((plan) => {
                const isPopular = plan.slug === 'yearly';
                const isFree = plan.slug === 'free';
                const priceText = formatPrice(isIndianUser ? plan.price_inr : plan.price_usd, isIndianUser);
                const intervalText = getIntervalText(plan.billing_interval);
                const featuresList = Array.isArray(plan.features) ? plan.features : [];

                return (
                  <div
                    key={plan.id}
                    className={cn(
                      'relative rounded-3xl bg-background border p-7 shadow-sm transition-all duration-300 flex flex-col justify-between',
                      isPopular
                        ? 'border-primary ring-2 ring-primary/20 shadow-xl bg-gradient-to-b from-primary/[0.03] to-background md:-translate-y-2'
                        : 'border-border/80 hover:border-border hover:shadow-md'
                    )}
                  >
                    {isPopular && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" /> Most Popular (Save 35%)
                      </div>
                    )}

                    <div>
                      {/* Plan Title & Desc */}
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-foreground mb-1">{plan.name}</h2>
                        <p className="text-xs text-muted-foreground min-h-[32px] leading-relaxed">
                          {plan.description}
                        </p>
                      </div>

                      {/* Price Tag */}
                      <div className="mb-6 pb-6 border-b border-border/50">
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-extrabold text-foreground tracking-tight">
                            {priceText}
                          </span>
                          {intervalText && (
                            <span className="text-xs text-muted-foreground font-medium">
                              {intervalText}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Feature List */}
                      <ul className="space-y-3 text-xs mb-8">
                        {featuresList.map((feat: string, idx: number) => {
                          const isExcluded = feat.startsWith('❌');
                          const cleanFeat = feat.replace(/^[❌✔️]\s*/, '');
                          return (
                            <li
                              key={idx}
                              className={cn(
                                'flex items-start gap-2.5 leading-relaxed',
                                isExcluded ? 'text-muted-foreground/60 line-through' : 'text-foreground'
                              )}
                            >
                              {isExcluded ? (
                                <span className="text-muted-foreground/40 shrink-0 font-mono">✕</span>
                              ) : (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                              )}
                              <span>{cleanFeat}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-4 border-t border-border/40">
                      {isFree ? (
                        user ? (
                          <Button variant="outline" className="w-full rounded-full" disabled>
                            Active Free Plan
                          </Button>
                        ) : (
                          <Link to="/resume-builder" className="w-full">
                            <Button variant="outline" className="w-full rounded-full font-semibold">
                              Start Free Now
                            </Button>
                          </Link>
                        )
                      ) : user ? (
                        <PremiumUpgradeButton
                          planType={plan.slug as any}
                          amount={isIndianUser ? Math.floor(plan.price_inr / 100) : Math.floor(plan.price_usd / 100)}
                          size="default"
                          className={cn(
                            'w-full rounded-full font-semibold shadow-md',
                            isPopular && 'bg-primary text-primary-foreground hover:bg-primary/90'
                          )}
                        >
                          Upgrade to {plan.name}
                        </PremiumUpgradeButton>
                      ) : (
                        <Link to="/login" className="w-full">
                          <Button
                            className={cn(
                              'w-full rounded-full font-semibold shadow-md',
                              isPopular ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-foreground text-background hover:bg-foreground/90'
                            )}
                          >
                            Sign In to Upgrade
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollReveal>

          {/* Guarantee / Value Banner */}
          <div className="max-w-4xl mx-auto rounded-3xl bg-[hsl(var(--surface-dark))] text-white p-8 sm:p-10 mb-20 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">100% Risk-Free ATS Guarantee</h3>
                <p className="text-xs text-white/70">
                  All resumes generated on MakeCV meet standard ATS specifications. Cancel anytime with no penalties.
                </p>
              </div>
            </div>
            <Link to="/resume-builder" className="shrink-0">
              <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 font-semibold">
                Make Your Resume Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Pricing FAQs */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/80 p-6 bg-card">
                <h3 className="text-base font-semibold mb-2">Is MakeCV really free to start?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Yes. You can build, customize with 30+ ATS templates, and download your finished resume PDF for free. No credit card is required to begin.
                </p>
              </div>
              <div className="rounded-2xl border border-border/80 p-6 bg-card">
                <h3 className="text-base font-semibold mb-2">How do AI actions work?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  AI actions power intelligent features like bullet point polishing, job match keyword analysis, summary generation, and translations. Your monthly allowance resets every 30 rolling days automatically.
                </p>
              </div>
              <div className="rounded-2xl border border-border/80 p-6 bg-card">
                <h3 className="text-base font-semibold mb-2">Can I cancel my subscription at any time?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Yes, you can cancel your subscription at any time directly from your Account Settings with one click. You will retain access until the end of your billing cycle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
