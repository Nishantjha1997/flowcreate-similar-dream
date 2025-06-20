
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PremiumUpgradeButton } from '@/components/PremiumUpgradeButton';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';

const Pricing = () => {
  const { user } = useAuth();
  const [isIndianUser, setIsIndianUser] = useState(false);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-8"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const features = [
    "Access to all templates",
    "Unlimited resume creations (Premium only)",
    "PDF and DOCX downloads",
    "ATS-friendly designs",
    "Real-time preview",
    "Custom styling options",
    "AI-powered content suggestions",
    "Cover letter templates",
    "Shareable resume links",
    "Cloud storage",
    "Version history",
    "No watermarks"
  ];

  const monthlyPrice = isIndianUser ? '₹199' : '$2.99';
  const yearlyPrice = isIndianUser ? '₹1,999' : '$19.99';
  const yearlyAmount = isIndianUser ? 1999 : 1999; // Keep INR amount for payment processing
  const monthlyAmount = isIndianUser ? 199 : 199; // Keep INR amount for payment processing

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4">
              Pricing
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mt-6 text-xl text-muted-foreground">
              FlowCreate is free for 1 resume, with a Premium plan for unlimited resumes and power users.
            </p>
          </div>
          <div className="max-w-4xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Free Plan */}
            <div className="rounded-xl border border-primary bg-card shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 bg-primary text-primary-foreground text-center">
                <h2 className="text-3xl font-bold">Free</h2>
                <div className="mt-4 flex items-center justify-center">
                  <span className="text-6xl font-bold tracking-tight">{isIndianUser ? '₹0' : '$0'}</span>
                  <span className="ml-2">/month</span>
                </div>
                <p className="mt-2 text-base">No credit card required. Save 1 resume per account.</p>
              </div>
              <div className="p-8">
                <ul className="space-y-2 text-foreground">
                  <li>✔️ All templates included</li>
                  <li>✔️ Live preview</li>
                  <li>✔️ Basic editing features</li>
                  <li>✔️ Save 1 resume</li>
                  <li>❌ AI suggestions</li>
                  <li>❌ Unlimited resumes</li>
                  <li>❌ Version history</li>
                  <li>❌ Cloud backup</li>
                  <li>❌ Premium support</li>
                </ul>
                <div className="mt-6 text-center">
                  {user ? (
                    <Button variant="outline" size="lg" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Link to="/register">
                      <Button variant="outline" size="lg">
                        Get Started Free
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
            {/* Premium Plan */}
            <div className="rounded-xl border border-yellow-500 bg-yellow-50 shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 bg-yellow-400 text-center" style={{ textShadow: "0px 1px 3px #fafafa, 0 1px 2px #00000016" }}>
                <h2 className="text-3xl font-bold" style={{ color: "#904803" }}>Premium</h2>
                <div className="mt-4 flex items-center justify-center">
                  <span className="text-6xl font-bold tracking-tight" style={{ color: "#202020", textShadow: "0 2px 6px #ffffff99" }}>{monthlyPrice}</span>
                  <span className="ml-2" style={{ color: "#202020" }}>/month</span>
                </div>
                <p className="mt-2 text-base" style={{ color: "#783f04" }}>Unlimited resumes, full AI and all premium features.</p>
              </div>
              <div className="p-8">
                <ul className="space-y-2 text-yellow-900 font-semibold">
                  <li>✔️ Everything in Free</li>
                  <li>✔️ Unlimited resumes</li>
                  <li>✔️ Unlimited AI suggestions</li>
                  <li>✔️ Version history</li>
                  <li>✔️ Cloud backup</li>
                  <li>✔️ Premium support</li>
                </ul>
                <div className="mt-6 text-center">
                  {user ? (
                    <PremiumUpgradeButton
                      planType="monthly"
                      amount={monthlyAmount}
                      size="lg"
                      className="w-full"
                    >
                      Upgrade to Premium
                    </PremiumUpgradeButton>
                  ) : (
                    <Link to="/login">
                      <Button size="lg" className="w-full">
                        Sign In to Upgrade
                      </Button>
                    </Link>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Premium unlocks unlimited resumes, storage, history, and more.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Yearly Plan Option */}
          {user && (
            <div className="max-w-2xl mx-auto mt-12">
              <div className="rounded-xl border-2 border-green-500 bg-green-50 shadow-lg overflow-hidden">
                <div className="p-6 bg-green-500 text-white text-center">
                  <h3 className="text-2xl font-bold">Yearly Premium</h3>
                  <div className="mt-2 flex items-center justify-center">
                    <span className="text-4xl font-bold">{yearlyPrice}</span>
                    <span className="ml-2">/year</span>
                  </div>
                  <p className="mt-1 text-green-100">
                    {isIndianUser ? 'Save ₹389 compared to monthly!' : 'Save $16.89 compared to monthly!'}
                  </p>
                </div>
                <div className="p-6 text-center">
                  <p className="text-green-800 mb-4">
                    Get 2 months free with our yearly plan. All premium features included.
                  </p>
                  <PremiumUpgradeButton
                    planType="yearly"
                    amount={yearlyAmount}
                    size="lg"
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Upgrade to Yearly - Save {isIndianUser ? '₹389' : '$16.89'}
                  </PremiumUpgradeButton>
                </div>
              </div>
            </div>
          )}

          {/* FAQs */}
          <div className="max-w-3xl mx-auto mt-20">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div className="rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-2">What's included in the Premium plan?</h3>
                <p className="text-muted-foreground">
                  Premium includes unlimited resumes, AI-powered content suggestions, cloud backup, 
                  version history, advanced customization options, and priority support - all for just ₹199/month.
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
                  access to Premium features until the end of your billing period.
                </p>
              </div>
              
              <div className="rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-2">Is there a free trial?</h3>
                <p className="text-muted-foreground">
                  You can use FlowCreate for free with 1 resume save. This gives you a chance to 
                  explore all the basic features before deciding to upgrade.
                </p>
              </div>
              
              <div className="rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-2">How can I support FlowCreate?</h3>
                <p className="text-muted-foreground">
                  The best way to support us is by upgrading to Premium for ₹199/month. This helps 
                  us maintain the platform, develop new features, and provide excellent support.
                </p>
              </div>
            </div>
          </div>

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
