import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TemplatesCarousel from '@/components/TemplatesCarousel';
import FeaturesSection from '@/components/FeaturesSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import CallToAction from '@/components/CallToAction';
import Footer from '@/components/Footer';
import { ScrollReveal } from '@/hooks/useScrollAnimation';
import { usePageMeta } from '@/hooks/usePageMeta';

const Index = () => {
  usePageMeta({
    title: 'FlowCreate - AI Resume Builder',
    description: 'Create a professional, ATS-friendly resume in minutes with FlowCreate\'s AI-powered builder.',
  });

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
