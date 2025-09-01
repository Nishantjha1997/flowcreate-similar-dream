
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
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
      {/* Background Pattern with transparency */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          backgroundSize: '30px 30px'
        }} />
      </div>

      {/* Floating elements for visual interest */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-300/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-20 md:py-28 lg:py-32 relative z-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 items-center">
          <div className="flex flex-col space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Create Professional Resumes with
              <span className="bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent"> AI-Powered Analysis</span>
            </h1>
            <p className="text-xl text-blue-100/90 leading-relaxed">
              Build standout resumes with intelligent suggestions, ATS optimization, and expert-designed templates. Get hired faster with AI-powered resume analysis.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <Link to="/resume-builder" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="w-full bg-white/90 backdrop-blur-sm text-primary hover:bg-white hover:scale-105 transition-all duration-300 shadow-xl border border-white/20"
                >
                  Create My Resume <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/templates" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Browse Templates
                </Button>
              </Link>
            </div>
            <p className="text-sm text-blue-100/80">
              No credit card required. AI-powered suggestions included.
            </p>
            
            {/* Trusted By Section with transparency */}
            <div className="flex flex-col space-y-4 pt-6">
              <p className="text-sm text-blue-200/90 font-medium">TRUSTED BY PROFESSIONALS FROM</p>
              <div className="flex flex-wrap gap-3">
                {companies.map((company) => (
                  <div 
                    key={company} 
                    className="text-white/90 font-semibold bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10 hover:bg-white/15 transition-all duration-300"
                  >
                    {company}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="relative mx-auto max-w-lg">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl transform transition-transform hover:scale-[1.02] duration-500">
              <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <img 
                  src="/images/hero-resume-builder.jpg" 
                  alt="Professional resume builder interface showing modern templates and AI-powered features for creating ATS-optimized resumes" 
                  className="w-full h-auto rounded-lg"
                  loading="eager"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 shadow-2xl backdrop-blur-sm border border-white/10">
                <p className="text-white font-bold text-sm">
                  Join 2M+ users with AI-optimized resumes
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
