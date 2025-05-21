
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Pricing = () => {
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
                  <span className="text-6xl font-bold tracking-tight">$0</span>
                  <span className="ml-2">/month</span>
                </div>
                <p className="mt-2 text-base">No credit card required. Save 1 resume per account.</p>
              </div>
              <div className="p-8">
                <ul className="space-y-2">
                  <li>✔️ All templates included</li>
                  <li>✔️ Live preview</li>
                  <li>✔️ AI suggestions (limited)</li>
                  <li>✔️ Save 1 resume</li>
                  <li>❌ Unlimited resumes</li>
                  <li>❌ Version history</li>
                  <li>❌ Cloud backup</li>
                  <li>❌ Premium support</li>
                </ul>
              </div>
            </div>
            {/* Premium Plan */}
            <div className="rounded-xl border border-yellow-500 bg-yellow-50 shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 bg-yellow-400 text-yellow-900 text-center">
                <h2 className="text-3xl font-bold">Premium</h2>
                <div className="mt-4 flex items-center justify-center">
                  <span className="text-6xl font-bold tracking-tight">$2</span>
                  <span className="ml-2">/month</span>
                </div>
                <p className="mt-2 text-base">Unlimited resumes, full AI and all premium features.</p>
              </div>
              <div className="p-8">
                <ul className="space-y-2">
                  <li>✔️ Everything in Free</li>
                  <li>✔️ Unlimited resumes</li>
                  <li>✔️ Unlimited AI suggestions</li>
                  <li>✔️ Version history</li>
                  <li>✔️ Premium support</li>
                </ul>
                <div className="mt-6 text-center">
                  <Button size="lg" variant="default" disabled>
                    Upgrade Coming Soon!
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Premium unlocks unlimited resumes, storage, history, and more.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="max-w-3xl mx-auto mt-20">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div className="rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-2">How can you offer everything for free?</h3>
                <p className="text-muted-foreground">
                  FlowCreate is an open-source project maintained by volunteers and community contributions. 
                  We believe that everyone should have access to high-quality resume tools regardless of their 
                  financial situation.
                </p>
              </div>
              
              <div className="rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-2">Is there really no premium plan?</h3>
                <p className="text-muted-foreground">
                  Correct! We don't have a premium tier or hidden upsells. All features are available to all users.
                </p>
              </div>
              
              <div className="rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-2">How do you sustain the platform?</h3>
                <p className="text-muted-foreground">
                  We operate on minimal costs thanks to our volunteer contributors. We accept donations to cover 
                  hosting expenses, but this is completely optional and doesn't unlock any additional features.
                </p>
              </div>
              
              <div className="rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-2">Can I use the resumes I create for commercial purposes?</h3>
                <p className="text-muted-foreground">
                  Absolutely! The resumes you create are yours to use however you wish. There are no restrictions 
                  on how you use your created resumes.
                </p>
              </div>
              
              <div className="rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-2">How can I support FlowCreate?</h3>
                <p className="text-muted-foreground">
                  If you'd like to support us, you can contribute to our open-source codebase, help translate 
                  the platform, report bugs, or make a small donation. But the best way to support us is simply 
                  by using the platform and spreading the word!
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
