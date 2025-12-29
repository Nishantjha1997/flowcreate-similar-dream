
import { Link } from 'react-router-dom';
import { useDesignMode } from '@/hooks/useDesignMode';

const Footer = () => {
  const { isNeoBrutalism } = useDesignMode();

  const linkClasses = isNeoBrutalism 
    ? 'text-sm text-foreground font-bold uppercase tracking-wide hover:text-primary transition-colors'
    : 'text-sm text-muted-foreground hover:text-foreground';

  const headingClasses = isNeoBrutalism
    ? 'text-sm font-black uppercase tracking-widest text-foreground border-b-2 border-foreground pb-2 mb-4'
    : 'text-sm font-semibold uppercase tracking-wider text-foreground';

  return (
    <footer className={`${
      isNeoBrutalism 
        ? 'bg-background border-t-4 border-foreground' 
        : 'bg-background border-t border-border'
    }`}>
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center">
              <span className={`text-2xl font-bold ${isNeoBrutalism ? 'uppercase tracking-wider' : ''} text-primary`}>Flow</span>
              <span className={`text-2xl font-bold ${isNeoBrutalism ? 'uppercase tracking-wider' : ''} text-foreground`}>Create</span>
            </Link>
            <p className={`mt-4 ${isNeoBrutalism ? 'text-sm text-foreground font-medium' : 'text-sm text-muted-foreground'}`}>
              Create professional resumes and cover letters online in minutes.
              Choose from our professionally-designed templates to build the perfect resume for your dream job.
            </p>
          </div>
          
          <div>
            <h3 className={headingClasses}>Product</h3>
            <ul className={`${isNeoBrutalism ? '' : 'mt-4'} space-y-2`}>
              <li>
                <Link to="/templates" className={linkClasses}>
                  Templates
                </Link>
              </li>
              <li>
                <Link to="/examples" className={linkClasses}>
                  Example Resumes
                </Link>
              </li>
              <li>
                <Link to="/features" className={linkClasses}>
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className={linkClasses}>
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className={headingClasses}>Resources</h3>
            <ul className={`${isNeoBrutalism ? '' : 'mt-4'} space-y-2`}>
              <li>
                <Link to="/blog" className={linkClasses}>
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/help" className={linkClasses}>
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/career-advice" className={linkClasses}>
                  Career Advice
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className={headingClasses}>Company</h3>
            <ul className={`${isNeoBrutalism ? '' : 'mt-4'} space-y-2`}>
              <li>
                <Link to="/about" className={linkClasses}>
                  About
                </Link>
              </li>
              <li>
                <Link to="/privacy" className={linkClasses}>
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className={linkClasses}>
                  Terms
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className={linkClasses}>
                  Shipping Policy
                </Link>
              </li>
              <li>
                <a 
                  href="https://github.com/flowcreate/resume-builder" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={linkClasses}
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className={`mt-12 pt-8 ${
          isNeoBrutalism 
            ? 'border-t-2 border-foreground' 
            : 'border-t border-border'
        }`}>
          <p className={`text-sm text-center ${isNeoBrutalism ? 'font-bold uppercase tracking-wide text-foreground' : 'text-muted-foreground'}`}>
            &copy; {new Date().getFullYear()} FlowCreate. All rights reserved. Open-source software.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
