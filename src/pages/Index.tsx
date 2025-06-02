
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TemplatesCarousel from '@/components/TemplatesCarousel';
import CallToAction from '@/components/CallToAction';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <TemplatesCarousel />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
