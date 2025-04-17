
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  const benefits = [
    "ATS-optimized templates",
    "AI-powered content suggestions",
    "Expert-written phrases",
    "One-click formatting"
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background with overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700">
            <div className="absolute inset-0 opacity-10" style={{ 
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              backgroundSize: '24px 24px'
            }} />
          </div>
          
          <div className="relative p-8 md:p-12 lg:p-16 z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="text-white">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Ready to Land Your Dream Job?
                </h2>
                <p className="mt-4 text-xl text-blue-100">
                  Create a professional resume in minutes and improve your chances of getting hired
                </p>
                
                <ul className="mt-8 space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-3 text-blue-300" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-10">
                  <Link to="/resume-builder">
                    <Button size="lg" className="bg-white text-primary hover:bg-blue-50">
                      Start Building Your Resume <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <p className="mt-4 text-sm text-blue-200">
                    No credit card required. Free to get started.
                  </p>
                </div>
              </div>
              
              <div className="hidden md:block">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887" 
                  alt="Success story" 
                  className="rounded-xl shadow-2xl"
                />
                <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                  <p className="text-white italic">
                    "FlowCreate helped me land interviews at 3 top tech companies. The templates are professional and the AI suggestions really improved my content."
                  </p>
                  <p className="text-blue-200 mt-2 font-semibold">
                    - Alex Chen, Software Engineer at Google
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
