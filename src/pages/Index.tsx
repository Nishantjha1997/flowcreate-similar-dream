import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TemplatesCarousel from '@/components/TemplatesCarousel';
import FeaturesSection from '@/components/FeaturesSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import CallToAction from '@/components/CallToAction';
import Footer from '@/components/Footer';
import { ScrollReveal } from '@/hooks/useScrollAnimation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { SITE_URL } from '@/lib/seo';
import { useEffect } from 'react';

const Index = () => {
  usePageMeta({
    title: 'Free Online Resume Builder — Create Professional Resumes',
    description: 'Build a professional resume online free with FlowCreate. 30+ ATS-friendly templates, AI-powered suggestions, and instant PDF download. No credit card required.',
  });

  useEffect(() => {
    document.getElementById('seo-structured-data')?.remove();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'seo-structured-data';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          name: 'FlowCreate',
          url: SITE_URL,
          description: 'Free online resume builder with 30+ professional templates, AI-powered suggestions, and instant PDF download.',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'All',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        },
        {
          '@type': 'Organization',
          name: 'FlowCreate',
          url: SITE_URL,
          logo: `${SITE_URL}/logo.svg`,
        },
        {
          '@type': 'WebSite',
          name: 'FlowCreate',
          url: SITE_URL,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${SITE_URL}/blog?search={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        },
      ],
    });
    document.head.appendChild(script);
    return () => {
      document.getElementById('seo-structured-data')?.remove();
    };
  }, []);

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
