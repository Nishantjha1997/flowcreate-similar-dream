
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8">About FlowCreate</h1>
            
            <div className="prose prose-lg mx-auto">
              <p className="text-lg mb-6">
                FlowCreate is a free, open-source resume building platform designed to help job seekers 
                create professional resumes quickly and easily. Our mission is to democratize access to 
                high-quality resume tools, making them available to everyone regardless of their financial situation.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Our Story</h2>
              <p className="mb-6">
                FlowCreate was created by a small team of developers and designers who were frustrated with 
                the lack of accessible, high-quality resume building tools. Many existing platforms were either 
                prohibitively expensive or offered limited functionality on their free plans. We believed that 
                everyone deserves access to tools that help them present their best professional self.
              </p>
              <p className="mb-6">
                Launched in 2023, FlowCreate is committed to remaining free and open-source forever. We believe 
                in transparency, community contribution, and continuous improvement based on user feedback.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Our Philosophy</h2>
              <p className="mb-6">
                We believe that a well-crafted resume shouldn't be a luxury. Our platform is built on three core principles:
              </p>
              <ul className="list-disc pl-6 mb-6">
                <li className="mb-2">
                  <strong>Accessibility:</strong> All features are available to all users, without paywalls or premium tiers.
                </li>
                <li className="mb-2">
                  <strong>Simplicity:</strong> Creating a resume should be straightforward and intuitive.
                </li>
                <li className="mb-2">
                  <strong>Quality:</strong> We offer professionally designed templates and expert guidance.
                </li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">How We're Funded</h2>
              <p className="mb-6">
                FlowCreate is maintained by community contributions and volunteers. We accept donations to 
                cover hosting costs, but the platform will always remain free to use. Our code is open-source 
                and available on GitHub, where we welcome contributions from developers who share our vision.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Join Our Mission</h2>
              <p className="mb-6">
                If you believe in our mission, there are several ways to contribute:
              </p>
              <ul className="list-disc pl-6 mb-6">
                <li className="mb-2">Use FlowCreate and provide feedback</li>
                <li className="mb-2">Share FlowCreate with others who might benefit</li>
                <li className="mb-2">Contribute to our codebase if you're a developer</li>
                <li className="mb-2">Support us with a donation to help cover operational costs</li>
              </ul>

              <p className="mb-6">
                Thank you for being part of our community. Together, we're making professional resume 
                creation accessible to everyone.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
