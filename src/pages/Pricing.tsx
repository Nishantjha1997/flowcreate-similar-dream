import Header from '@/components/Header';
import { ScrollReveal } from '@/hooks/useScrollAnimation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle, HelpCircle, ArrowRight } from 'lucide-react';
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
    name: 'Free',
    slug: 'free',
    description: 'No credit card required. Save 1 resume per account.',
    price_inr: 0,
    price_usd: 0,
    billing_interval: 'free',
    features: ['All standard templates', 'Live preview', 'ATS-friendly PDF export', 'Save 1 resume', '0 AI actions / 30 days', '❌ Unlimited resumes', '❌ Version history', '❌ Cloud backup', '❌ Premium support']
  },
  {
    id: 'monthly',
    name: 'Monthly',
    slug: 'monthly',
    description: 'Unlimited resumes with 100 AI actions every rolling 30 days.',
    price_inr: 29900,
    price_usd: 499,
    billing_interval: 'month',
    features: ['Everything in Free', 'Unlimited resumes', '100 AI actions / 30 days', 'Version history', 'Cloud backup', 'Premium support']
  },
  {
    id: 'yearly',
    name: 'Yearly',
    slug: 'yearly',
    description: 'Best value with 150 AI actions every rolling 30 days.',
    price_inr: 249900,
    price_usd: 3999,
    billing_interval: 'year',
    features: ['Everything in Monthly', '150 AI actions / 30 days', '2 months free', 'Priority support', 'Advanced features', 'Version history', 'Cloud backup']
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    slug: 'lifetime',
    description: 'Lifetime access with 150 AI actions every rolling 30 days.',
    price_inr: 499900,
    price_usd: 7999,
    billing_interval: 'lifetime',
    features: ['Everything in Yearly', '150 AI actions / 30 days', 'Lifetime updates', 'Future template updates', 'Advanced customization', 'Dedicated support', 'Fair-use access']
  }
];

const getPlanStyles = (slug: string) => {
  switch (slug) {
    case 'free':
      return {
        cardClass: "rounded-xl border border-primary bg-card shadow-sm overflow-hidden flex flex-col",
        headerClass: "p-6 bg-primary text-primary-foreground text-center",
        titleStyle: {},
        titleClass: "text-2xl font-bold",
        priceStyle: {},
        descClass: "mt-2 text-base text-primary-foreground/90",
        featureClass: "space-y-2 text-foreground text-sm",
        btnVariant: "outline" as const
      };
    case 'monthly':
      return {
        cardClass: "rounded-xl border border-yellow-500 bg-yellow-50/50 shadow-sm overflow-hidden flex flex-col dark:bg-yellow-950/20",
        headerClass: "p-6 bg-yellow-400 dark:bg-yellow-600 text-center",
        titleStyle: {},
        titleClass: "text-2xl font-bold text-[#904803] dark:text-yellow-50",
        priceStyle: {},
        descClass: "mt-2 text-base text-yellow-800 dark:text-yellow-200",
        featureClass: "space-y-2 text-yellow-900 dark:text-yellow-100 font-semibold text-sm",
        btnVariant: "default" as const
      };
    case 'yearly':
      return {
        cardClass: "rounded-xl border-2 border-green-500 bg-green-50/50 shadow-lg overflow-hidden flex flex-col dark:bg-green-950/20",
        headerClass: "p-6 bg-green-500 text-white text-center",
        titleStyle: {},
        titleClass: "text-2xl font-bold",
        priceStyle: {},
        descClass: "mt-2 text-base text-green-100",
        featureClass: "space-y-2 text-green-900 dark:text-green-100 font-semibold text-sm",
        btnVariant: "default" as const
      };
    case 'lifetime':
      return {
        cardClass: "rounded-xl border-2 border-purple-500 bg-purple-50/50 shadow-lg overflow-hidden flex flex-col dark:bg-purple-950/20",
        headerClass: "p-6 bg-purple-500 text-white text-center",
        titleStyle: {},
        titleClass: "text-2xl font-bold",
        priceStyle: {},
        descClass: "mt-2 text-base text-purple-100",
        featureClass: "space-y-2 text-purple-900 dark:text-purple-100 font-semibold text-sm",
        btnVariant: "default" as const
      };
    default:
      return {
        cardClass: "rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col",
        headerClass: "p-6 bg-muted text-center",
        titleStyle: {},
        titleClass: "text-2xl font-bold text-foreground",
        priceStyle: {},
        descClass: "mt-2 text-base text-muted-foreground",
        featureClass: "space-y-2 text-foreground text-sm",
        btnVariant: "default" as const
      };
  }
};

const formatPrice = (amount: number, isINR: boolean) => {
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
    case 'year': return '/year';
    case 'lifetime': return '';
    case 'free': return '/month';
    default: return '';
  }
};

const Pricing = () => {
  usePageMeta({
    title: 'Pricing — Free Resume Builder Plans | FlowCreate',
    description: 'FlowCreate is free forever. Upgrade for unlimited resumes and a generous AI allowance. Plans from ₹299/month. No hidden fees.',
  });

  // FAQ structured data for Google rich snippets
  useEffect(() => {
    const faqScript = document.createElement('script');
    faqScript.type = 'application/ld+json';
    faqScript.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is FlowCreate really free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. FlowCreate has a permanently free plan that lets you create and download 1 resume with access to all templates. No credit card required.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I cancel my subscription anytime?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Absolutely. You can cancel your subscription at any time from your account settings. You will retain access until the end of your billing period.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is included in the free plan?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The free plan includes access to all resume templates, live preview, basic editing features, and the ability to save and download 1 resume as a PDF.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do you offer a refund?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. We offer a full refund within 7 days of purchase if you are not satisfied with the premium features.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are the resume templates ATS-friendly?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. All FlowCreate templates are designed to pass through Applicant Tracking Systems (ATS) used by employers. They use clean formatting and standard fonts recognized by ATS software.',
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
    }
  });

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

  if (loading || loadingPlans) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded mb-4"></div>
                <div className="h-4 bg-muted rounded mb-8"></div>
              </div>
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
      <main className="py-16">
        <div className="container mx-auto px-4">
          <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4">
              Pricing
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mt-6 text-xl text-muted-foreground">
              FlowCreate is free for 1 resume, with Premium plans for unlimited resumes and generous AI allowances.
            </p>
          </div>
          </ScrollReveal>

          <p className="mx-auto mt-6 max-w-3xl text-center text-sm text-muted-foreground">
            AI actions reset every 30 days. One action covers a successful resume suggestion,
            job-match analysis, cover-letter generation, or translation. PDF import has separate
            protection and does not consume this allowance.
          </p>
          <ScrollReveal delay={100}>
          <div className="max-w-7xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan) => {
              const styles = getPlanStyles(plan.slug);
              const priceText = formatPrice(isIndianUser ? plan.price_inr : plan.price_usd, isIndianUser);
              const intervalText = getIntervalText(plan.billing_interval);
              const isFree = plan.slug === 'free';
              const featuresList = Array.isArray(plan.features) ? plan.features : [];

              return (
                <div key={plan.id} className={styles.cardClass}>
                  <div className={styles.headerClass} style={plan.slug === 'monthly' ? { textShadow: "0px 1px 3px rgba(255,255,255,0.2), 0 1px 2px rgba(0,0,0,0.1)" } : undefined}>
                    <h2 className={styles.titleClass} style={styles.titleStyle}>{plan.name}</h2>
                    <div className="mt-4 flex items-center justify-center">
                      <span className="text-5xl font-bold tracking-tight" style={styles.priceStyle}>{priceText}</span>
                      {intervalText && <span className={cn("ml-2 text-sm", plan.slug === 'monthly' && "text-[#202020] dark:text-yellow-100")}>{intervalText}</span>}
                    </div>
                    {plan.description && <p className={styles.descClass}>{plan.description}</p>}
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <ul className={styles.featureClass}>
                      {featuresList.map((feat: string, idx: number) => {
                        const hasX = feat.startsWith('❌');
                        const hasCheck = feat.startsWith('✔️');
                        let cleanFeat = feat;
                        let prefix = '✔️ ';
                        if (hasX) {
                          prefix = '❌ ';
                          cleanFeat = feat.substring(2);
                        } else if (hasCheck) {
                          cleanFeat = feat.substring(2);
                        }
                        return (
                          <li key={idx} className={cn("flex items-start gap-1.5", hasX && 'text-muted-foreground font-normal line-through opacity-70')}>
                            <span>{prefix}</span>
                            <span>{cleanFeat}</span>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="mt-6 text-center">
                      {isFree ? (
                        user ? (
                          <Button variant="outline" size="lg" disabled className="w-full">
                            Current Plan
                          </Button>
                        ) : (
                          <Link to="/register" className="w-full">
                            <Button variant="outline" size="lg" className="w-full">
                              Get Started Free
                            </Button>
                          </Link>
                        )
                      ) : (
                        user ? (
                          <PremiumUpgradeButton
                            planType={plan.slug as any}
                            amount={isIndianUser ? Math.floor(plan.price_inr / 100) : Math.floor(plan.price_usd / 100)}
                            size="lg"
                            className={cn(
                              "w-full",
                              plan.slug === 'yearly' && "bg-green-600 hover:bg-green-700",
                              plan.slug === 'lifetime' && "bg-purple-600 hover:bg-purple-700"
                            )}
                          >
                            Upgrade to {plan.name}
                          </PremiumUpgradeButton>
                        ) : (
                          <Link to="/login" className="w-full">
                            <Button size="lg" className={cn(
                              "w-full",
                              plan.slug === 'yearly' && "bg-green-600 hover:bg-green-700",
                              plan.slug === 'lifetime' && "bg-purple-600 hover:bg-purple-700"
                            )}>
                              Sign In to Upgrade
                            </Button>
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FAQs */}
          <div className="max-w-3xl mx-auto mt-20">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div className="rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-2">What's included in the Premium plans?</h3>
                <p className="text-muted-foreground">
                  Premium includes unlimited resumes, a plan-based AI allowance, cloud backup, 
                  version history, advanced customization options, and priority support.
                </p>
              </div>
              
              <div className="rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-2">How do AI suggestions work?</h3>
                <p className="text-muted-foreground">
                  Our AI analyzes your existing content and provides intelligent suggestions to improve 
                  your resume sections, making them more compelling and ATS-friendly.
                </p>
              </div>
              
              <div className="rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-2">Can I cancel anytime?</h3>
                <p className="text-muted-foreground">
                  Yes! You can cancel your Premium subscription at any time. You'll continue to have 
                  access to Premium features until the end of your billing period. AI allowances
                  reset every 30 days.
                </p>
              </div>
              
              <div className="rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-2">What's the difference between Yearly and Lifetime?</h3>
                <p className="text-muted-foreground">
                  Yearly plans provide access for 12 months and need to be renewed. Lifetime plans 
                  provide permanent access with a one-time payment and include all future updates.
                </p>
              </div>
              
              <div className="rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-2">Is there a free trial?</h3>
                <p className="text-muted-foreground">
                  You can use FlowCreate for free with 1 resume save. This gives you a chance to 
                  explore all the basic features before deciding to upgrade.
                </p>
              </div>
            </div>
          </div>
          </ScrollReveal>

          {/* Still have questions */}
          <div className="max-w-3xl mx-auto mt-20 text-center">
            <div className="rounded-xl bg-muted p-8">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Still have questions?</h2>
              <p className="text-muted-foreground mb-6">
                Can't find the answer you're looking for? Please reach out to our support team.
              </p>
              <Button variant="outline">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
