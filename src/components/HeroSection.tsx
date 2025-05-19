import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const companies = [
    'Google',
    'Microsoft',
    'Adobe',
    'Amazon',
    'Meta'
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          backgroundSize: '24px 24px'
        }} />
      </div>

      <div className="container mx-auto px-4 py-20 md:py-28 lg:py-32">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 items-center">
          <div className="flex flex-col space-y-6 animate-fade-in z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Land Your Dream Job with a Standout Resume
            </h1>
            <p className="text-xl text-blue-100">
              Create a professional resume in minutes with our easy-to-use builder, AI assistance, and expert-designed templates.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
              <Link to="/resume-builder" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="w-full bg-white text-primary hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Create My Resume <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/templates" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full border-white text-primary hover:bg-white/10 hover:scale-105 transition-all duration-300"
                >
                  Browse Templates
                </Button>
              </Link>
            </div>
            <p className="text-sm text-blue-100">
              No credit card required. Free to get started.
            </p>
            
            {/* Trusted By Section */}
            <div className="flex flex-col space-y-4">
              <p className="text-sm text-blue-200 font-medium">TRUSTED BY PROFESSIONALS FROM</p>
              <div className="flex flex-wrap gap-4">
                {companies.map((company) => (
                  <div 
                    key={company} 
                    className="text-white/90 font-semibold bg-white/10 rounded-lg px-4 py-2 backdrop-blur-sm"
                  >
                    {company}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="relative mx-auto max-w-lg z-10">
            <div className="relative rounded-xl overflow-hidden shadow-2xl transform transition-transform hover:scale-[1.02]">
              <div className="bg-white p-4 rounded-xl">
                <img 
                  src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?q=80&w=2070" 
                  alt="Resume builder interface" 
                  className="w-full h-auto rounded-lg"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 bg-blue-500 rounded-lg p-4 shadow-xl">
                <p className="text-white font-bold">
                  Join 2M+ users creating standout resumes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
