
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="rounded-2xl hero-gradient p-8 md:p-12 lg:p-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to create your professional resume?
            </h2>
            <p className="mt-4 text-xl text-blue-100">
              Get started for free and land your dream job with a standout resume
            </p>
            <div className="mt-8">
              <Link to="/resume-builder">
                <Button size="lg" className="bg-white text-primary hover:bg-blue-50">
                  Create My Resume <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-blue-100">
              No credit card required. Free to get started.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
