
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Refund and Cancellation Policy</h1>
          
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">No Refund Policy</h2>
              <p className="text-red-700 dark:text-red-300 font-semibold">
                ALL SALES ARE FINAL. FlowCreate does not provide refunds for any subscription purchases under any circumstances.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. No Refund Policy</h2>
              <p className="mb-4">
                By purchasing any subscription plan (Monthly ₹199 or Annual ₹1999), you acknowledge and agree that:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>No refunds will be provided</strong> for any reason whatsoever</li>
                <li>All payments are final and non-refundable</li>
                <li>This policy applies to all subscription types and durations</li>
                <li>Technical issues, change of mind, or dissatisfaction do not qualify for refunds</li>
                <li>Accidental purchases are not eligible for refunds</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Subscription Cancellation</h2>
              <p className="mb-4">
                While refunds are not available, you can cancel your subscription at any time:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Log into your account and go to Account Settings</li>
                <li>Navigate to the Subscription section</li>
                <li>Click "Cancel Subscription"</li>
                <li>Your premium access will continue until the end of your current billing period</li>
                <li>No further charges will be made after cancellation</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. What Happens After Cancellation</h2>
              <p className="mb-4">
                When you cancel your subscription:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>You retain access to premium features until the end of your billing period</li>
                <li>After the billing period ends, your account reverts to the free plan</li>
                <li>Your resume data remains saved in your account</li>
                <li>You can re-subscribe at any time to regain premium access</li>
                <li><strong>No refund is provided for the unused portion of your subscription</strong></li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Free Trial Policy</h2>
              <p className="mb-4">
                Currently, FlowCreate does not offer free trials. All subscriptions begin immediately upon payment and are subject to this no-refund policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Payment Processing</h2>
              <p className="mb-4">
                All payments are processed securely through Razorpay. Once payment is confirmed:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Your premium subscription is activated immediately</li>
                <li>You gain instant access to all premium features</li>
                <li>The transaction is final and cannot be reversed</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Technical Issues</h2>
              <p className="mb-4">
                If you experience technical difficulties:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Contact our support team at support@flowcreate.com</li>
                <li>We will work to resolve technical issues promptly</li>
                <li>Technical support does not constitute grounds for a refund</li>
                <li>Service interruptions do not qualify for refunds</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Billing Disputes</h2>
              <p className="mb-4">
                For billing inquiries:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Contact support@flowcreate.com within 30 days of the charge</li>
                <li>Provide your account email and transaction details</li>
                <li>We will investigate legitimate billing errors</li>
                <li>Billing disputes do not guarantee refunds</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Legal Compliance</h2>
              <p className="mb-4">
                This no-refund policy is enforced to the fullest extent permitted by applicable law. By using our service, you waive any right to dispute charges or request refunds through your payment provider.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Policy Updates</h2>
              <p className="mb-4">
                We reserve the right to update this refund policy at any time. Changes will be posted on this page with an updated revision date. Your continued use of the service after changes constitutes acceptance of the new policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
              <p>
                For questions about cancellations or this policy:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> support@flowcreate.com<br />
                <strong>Response Time:</strong> Within 24 hours
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

export default RefundPolicy;
