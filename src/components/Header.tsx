
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MenuIcon, X } from 'lucide-react';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary">Flow</span>
              <span className="text-2xl font-bold text-foreground">Create</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex md:items-center md:space-x-6">
            <Link to="/templates" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
              Templates
            </Link>
            <Link to="/features" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
              Features
            </Link>
            <Link to="/pricing" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
              Pricing
            </Link>
            <Link to="/blog" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
              Blog
            </Link>
          </nav>

          <div className="hidden md:flex md:items-center md:space-x-3">
            <Link to="/login">
              <Button variant="outline" size="sm">
                Sign in
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">
                Sign up
              </Button>
            </Link>
          </div>

          <div className="flex md:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <MenuIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="fixed inset-0 z-50 overflow-y-auto bg-background px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <Link to="/" className="flex items-center">
                  <span className="text-2xl font-bold text-primary">Flow</span>
                  <span className="text-2xl font-bold text-foreground">Create</span>
                </Link>
              </div>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="space-y-6 py-6">
                <Link
                  to="/templates"
                  className="block text-base font-medium text-foreground/70 hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Templates
                </Link>
                <Link
                  to="/features"
                  className="block text-base font-medium text-foreground/70 hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  to="/pricing"
                  className="block text-base font-medium text-foreground/70 hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  to="/blog"
                  className="block text-base font-medium text-foreground/70 hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Blog
                </Link>
              </div>
              <div className="mt-6 space-y-2">
                <Link
                  to="/login"
                  className="block w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="outline" className="w-full">
                    Sign in
                  </Button>
                </Link>
                <Link
                  to="/register"
                  className="block w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full">
                    Sign up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
