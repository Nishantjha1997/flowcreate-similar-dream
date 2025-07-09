
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
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/account" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors">
                  Build Your Profile
                </Link>
                <Link to="/resume-builder" className="inline-flex items-center justify-center px-6 py-3 border border-input text-base font-medium rounded-md text-foreground bg-background hover:bg-muted transition-colors">
                  Start Creating Resume
                </Link>
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
