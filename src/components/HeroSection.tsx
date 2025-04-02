
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <div className="hero-gradient text-white">
      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 items-center">
          <div className="flex flex-col space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Create your perfect resume in minutes
            </h1>
            <p className="text-xl text-blue-100">
              Professional templates, AI writing assistant, and expert guidance to help you build a resume 
              that gets you noticed and lands you interviews.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
              <Link to="/resume-builder" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="w-full bg-white text-primary hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Create My Resume <ArrowRight className="ml-2 h-5 w-5 animate-pulse" />
                </Button>
              </Link>
              <Link to="/templates" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full bg-white text-primary hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Browse Templates
                </Button>
              </Link>
            </div>
            <p className="text-sm text-blue-100">
              No credit card required. Free to get started.
            </p>
          </div>
          
          <div className="relative mx-auto max-w-lg animate-slide-up">
            <div className="relative rounded-lg shadow-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b" 
                alt="Resume builder interface" 
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
            <div className="absolute -bottom-6 -right-6 bg-accent rounded-lg p-4 shadow-lg">
              <p className="text-white font-bold">
                Join 2M+ users creating standout resumes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
