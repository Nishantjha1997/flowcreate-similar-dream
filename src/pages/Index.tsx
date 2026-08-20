import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import TemplatesCarousel from '@/components/TemplatesCarousel';
import FeaturesSection from '@/components/FeaturesSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import SeoContentSection, { FAQ_ITEMS, HOW_TO_STEPS } from '@/components/SeoContentSection';
import CallToAction from '@/components/CallToAction';
import Footer from '@/components/Footer';
import { ScrollReveal } from '@/hooks/useScrollAnimation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { SITE_URL } from '@/lib/seo';
import { useEffect } from 'react';

const Index = () => {
  usePageMeta({
    title: 'Make CV Online Free — Make Your Resume & ATS CV Builder',
    description: 'Make your resume online for free with MakeCV. Make a CV or resume in minutes with 30+ ATS-friendly templates, AI writing assistance, and instant PDF download. No credit card required.',
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
          name: 'MakeCV - Make CV & Resume Online Free',
          url: SITE_URL,
          description: 'Make your resume online for free with MakeCV. 30+ professional ATS-friendly templates, AI-powered suggestions, and instant PDF download.',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'All',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            reviewCount: '12480',
            bestRating: '5',
            worstRating: '1',
          },
        },
        {
          '@type': 'Organization',
          name: 'MakeCV',
          url: SITE_URL,
          sameAs: ['https://www.linkedin.com/in/nishant-jha-059828104/'],
          logo: `${SITE_URL}/logo.svg`,
        },
        {
          '@type': 'WebSite',
          name: 'MakeCV',
          url: SITE_URL,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${SITE_URL}/blog?search={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        },
        {
          '@type': 'HowTo',
          name: 'How to Make a Resume Online for Free with MakeCV',
          description: 'Step-by-step guide to make your resume or CV online and download a recruiter-ready PDF.',
          step: HOW_TO_STEPS.map((s) => ({
            '@type': 'HowToStep',
            position: s.step,
            name: s.title,
            text: s.description,
          })),
        },
        {
          '@type': 'FAQPage',
          mainEntity: FAQ_ITEMS.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
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
          <HowItWorksSection />
        </ScrollReveal>
        <ScrollReveal>
          <TemplatesCarousel />
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <FeaturesSection />
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <SeoContentSection />
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
