
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
          
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-8">
              Last updated: December 2024
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <p className="mb-4">
                We collect information to provide better services to our users. We collect information in the following ways:
              </p>
              
              <h3 className="text-xl font-medium mb-3">Information You Provide</h3>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Account information (email address, name)</li>
                <li>Resume content (personal details, work experience, education, skills)</li>
                <li>Payment information (processed securely through Razorpay)</li>
                <li>Communication with our support team</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">Information We Collect Automatically</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Device information (browser type, operating system)</li>
                <li>Usage data (pages visited, features used, time spent)</li>
                <li>IP address and location data</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p className="mb-4">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Provide and maintain our resume building service</li>
                <li>Process payments and manage subscriptions</li>
                <li>Improve and personalize user experience</li>
                <li>Generate AI-powered content suggestions (Premium feature)</li>
                <li>Send important service updates and notifications</li>
                <li>Provide customer support</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
              <p className="mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Service Providers:</strong> Trusted third parties who assist in operating our service (hosting, payment processing, analytics)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>Consent:</strong> With your explicit consent for specific purposes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Third-Party Services</h2>
              <p className="mb-4">
                Our service integrates with the following third-party providers:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Supabase:</strong> Database and authentication services</li>
                <li><strong>Razorpay:</strong> Payment processing (subject to Razorpay's privacy policy)</li>
                <li><strong>Google Gemini AI:</strong> AI content generation for premium users</li>
                <li><strong>Analytics Providers:</strong> Service improvement and usage analytics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
              <p className="mb-4">
                We implement appropriate security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal data on a need-to-know basis</li>
                <li>Secure payment processing through PCI-compliant providers</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
              <p className="mb-4">
                We retain your information for as long as necessary to provide our services:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Account data: Until you delete your account</li>
                <li>Resume content: Until you delete specific resumes or your account</li>
                <li>Payment data: As required by law and payment processors</li>
                <li>Usage data: Aggregated data may be retained indefinitely for analytics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
              <p className="mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Export your resume data</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, contact us at privacy@flowcreate.com
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Cookies and Tracking</h2>
              <p className="mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Remember your preferences and login status</li>
                <li>Analyze site usage and improve performance</li>
                <li>Provide personalized content and features</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
              <p className="mt-4">
                You can control cookies through your browser settings, but some features may not function properly if cookies are disabled.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
              <p className="mb-4">
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. International Data Transfers</h2>
              <p className="mb-4">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your personal information in accordance with applicable privacy laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of the service after changes constitutes acceptance of the new policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> privacy@flowcreate.com<br />
                <strong>Support:</strong> support@flowcreate.com<br />
                <strong>Response Time:</strong> Within 48 hours
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

export default Privacy;
