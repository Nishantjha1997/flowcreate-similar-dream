
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Cancellation and Refund Policy</h1>
          
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-2">Important Notice</h2>
              <p className="text-blue-700 dark:text-blue-300">
                Please review our cancellation and refund terms carefully before making a purchase. All payments are processed immediately and subscription benefits are activated instantly.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Subscription Cancellation</h2>
              <p className="mb-4">
                You can cancel your FlowCreate subscription at any time through your account settings:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Log into your account and navigate to Account Settings</li>
                <li>Go to the Subscription section</li>
                <li>Click "Cancel Subscription"</li>
                <li>Your premium access will continue until the end of your current billing period</li>
                <li>No future charges will be made after successful cancellation</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. What Happens After Cancellation</h2>
              <p className="mb-4">
                When you cancel your subscription:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>You retain access to premium features until your billing period ends</li>
                <li>Your account automatically reverts to the free plan afterward</li>
                <li>All your resume data remains safely stored in your account</li>
                <li>You can reactivate your subscription at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Refund Policy</h2>
              <p className="mb-4">
                Due to the instant digital nature of our service and immediate activation of premium features:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>All subscription purchases are considered final</li>
                <li>Premium features are activated immediately upon payment confirmation</li>
                <li>Refunds are not provided for unused portions of active subscriptions</li>
                <li>This policy applies to both monthly (₹199) and annual (₹1999) plans</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Free Trial Information</h2>
              <p className="mb-4">
                Currently, FlowCreate does not offer free trial periods. All subscriptions begin immediately upon successful payment and provide instant access to premium features.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Payment Processing</h2>
              <p className="mb-4">
                All payments are securely processed through Razorpay. Upon successful payment:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Your premium subscription activates immediately</li>
                <li>You gain instant access to all premium templates and features</li>
                <li>AI-powered suggestions become available right away</li>
                <li>Advanced customization options are unlocked</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Technical Support</h2>
              <p className="mb-4">
                If you experience any technical issues with our service:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Contact our support team at support@flowcreate.com</li>
                <li>We're committed to resolving technical problems promptly</li>
                <li>Our team will work with you to ensure you can access your premium features</li>
                <li>Response time is typically within 24 hours</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Billing Inquiries</h2>
              <p className="mb-4">
                For any billing-related questions:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Contact support@flowcreate.com with your account details</li>
                <li>Include your transaction ID and billing email</li>
                <li>We'll investigate any legitimate billing concerns</li>
                <li>Please reach out within 30 days of the transaction</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Auto-Renewal</h2>
              <p className="mb-4">
                Subscription plans automatically renew unless cancelled:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Monthly plans renew every 30 days</li>
                <li>Annual plans renew every 365 days</li>
                <li>You'll receive a reminder email before renewal</li>
                <li>Cancel anytime to prevent future charges</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Policy Updates</h2>
              <p className="mb-4">
                We may update this policy from time to time. Changes will be posted on this page with an updated date. Your continued use of our service constitutes acceptance of any policy changes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
              <p>
                For questions about cancellations, billing, or this policy:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> support@flowcreate.com<br />
                <strong>Response Time:</strong> Within 24 hours<br />
                <strong>Business Hours:</strong> Monday to Friday, 9 AM - 6 PM IST
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
