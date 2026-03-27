import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TemplatesCarousel from '@/components/TemplatesCarousel';
import FeaturesSection from '@/components/FeaturesSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import CallToAction from '@/components/CallToAction';
import Footer from '@/components/Footer';
import { ScrollReveal } from '@/hooks/useScrollAnimation';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ScrollReveal>
          <TemplatesCarousel />
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <FeaturesSection />
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <TestimonialsSection />
        </ScrollReveal>
        <ScrollReveal delay={150}>
          <CallToAction />
        </ScrollReveal>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
