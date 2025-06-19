
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Shipping Policy</h1>
          
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-2">Digital Service Notice</h2>
              <p className="text-blue-700 dark:text-blue-300">
                FlowCreate is a digital resume building service. We do not ship physical products. All our services are delivered digitally through our online platform.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Service Delivery</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>All resume templates and premium features are delivered instantly upon successful payment</li>
                <li>Premium account upgrades are activated immediately after payment confirmation</li>
                <li>Resume downloads (PDF) are available instantly through your account dashboard</li>
                <li>No physical shipping is required as all services are cloud-based</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Access to Services</h2>
              <p className="mb-4">
                Upon successful payment and account upgrade:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Premium templates become immediately accessible</li>
                <li>AI-powered suggestions are enabled instantly</li>
                <li>Advanced customization features are unlocked</li>
                <li>PDF download capabilities are activated</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Technical Requirements</h2>
              <p className="mb-4">
                To access our services, you need:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>A stable internet connection</li>
                <li>A modern web browser (Chrome, Firefox, Safari, Edge)</li>
                <li>A valid email address for account verification</li>
                <li>JavaScript enabled in your browser</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Service Availability</h2>
              <p className="mb-4">
                Our services are available 24/7, subject to:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Scheduled maintenance windows (notified in advance)</li>
                <li>Temporary outages due to technical issues</li>
                <li>Third-party service dependencies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <p>
                If you have any questions about our service delivery or access issues, please contact us at:
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

export default ShippingPolicy;
