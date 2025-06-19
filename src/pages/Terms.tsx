
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Terms and Conditions</h1>
          
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-8">
              Last updated: December 2024
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using FlowCreate ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
              <p className="mb-4">
                FlowCreate is an online resume building platform that provides:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Professional resume templates</li>
                <li>AI-powered content suggestions (Premium feature)</li>
                <li>Resume customization tools</li>
                <li>PDF export functionality</li>
                <li>Account management features</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              <p className="mb-4">
                To access certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your password</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Payment Terms</h2>
              <p className="mb-4">
                For Premium services:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Monthly subscription: ₹199 per month</li>
                <li>Annual subscription: ₹1999 per year</li>
                <li>All payments are processed securely through Razorpay</li>
                <li>Subscriptions auto-renew unless cancelled</li>
                <li><strong>No refunds are provided upon cancellation</strong></li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Refund and Cancellation Policy</h2>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <p className="text-red-800 dark:text-red-200 font-semibold">
                  <strong>NO REFUNDS:</strong> All sales are final. We do not provide refunds for any subscription purchases, whether monthly or annual. Once payment is processed, no refund will be issued under any circumstances.
                </p>
              </div>
              <p className="mt-4">
                You may cancel your subscription at any time, but you will retain access to premium features until the end of your current billing period.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
              <p className="mb-4">
                The Service and its original content, features, and functionality are owned by FlowCreate and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. User Content</h2>
              <p className="mb-4">
                You retain ownership of all content you submit to the Service. By using the Service, you grant us a license to use, store, and process your content solely for the purpose of providing the Service to you.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Prohibited Uses</h2>
              <p className="mb-4">
                You may not use the Service:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>For any unlawful purpose or to solicit others to perform acts contrary to law</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Service Availability</h2>
              <p className="mb-4">
                We strive to maintain high service availability but do not guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or technical issues.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
              <p className="mb-4">
                In no event shall FlowCreate, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
              <p className="mb-4">
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
              <p>
                If you have any questions about these Terms and Conditions, please contact us at:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> legal@flowcreate.com<br />
                <strong>Support:</strong> support@flowcreate.com
              </p>
            </section>

            <footer className="text-sm text-muted-foreground mt-12 pt-6 border-t">
              <p>Last updated: December 2024</p>
            </footer>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
