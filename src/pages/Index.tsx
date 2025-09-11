
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TemplatesCarousel from '@/components/TemplatesCarousel';
import FeaturesSection from '@/components/FeaturesSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import CallToAction from '@/components/CallToAction';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">Start with Your Professional Profile</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Build your comprehensive professional profile once, and use it to create unlimited resumes with different templates. 
                Save time by filling out your information just once - including work experience, education, skills, projects, and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link to="/account" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors">
                  Build Your Profile
                </Link>
                <Link to="/resume-builder" className="inline-flex items-center justify-center px-6 py-3 border border-input text-base font-medium rounded-md text-foreground bg-background hover:bg-muted transition-colors">
                  Start Creating Resume
                </Link>
              </div>
              
              {/* Quick Import Demo */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-xl font-semibold mb-3 text-blue-900">💡 Pro Tip: Import from Existing Resume</h3>
                <p className="text-blue-700 mb-4">
                  Already have a resume? Upload your PDF and our AI will extract all your information automatically. 
                  No need to type everything from scratch!
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-blue-600">
                  <span className="flex items-center"><span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2">1</span>Upload PDF</span>
                  <span className="flex items-center"><span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2">2</span>AI Extracts Data</span>
                  <span className="flex items-center"><span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2">3</span>Review & Import</span>
                  <span className="flex items-center"><span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2">4</span>Done!</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <TemplatesCarousel />
        <FeaturesSection />
        <TestimonialsSection />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
