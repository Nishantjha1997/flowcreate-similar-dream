import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDesignMode } from '@/hooks/useDesignMode';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

// Auto-generate breadcrumbs from current path
const pathLabels: Record<string, string> = {
  '': 'Home',
  'admin': 'Admin Dashboard',
  'account': 'My Account',
  'resume-builder': 'Resume Builder',
  'templates': 'Templates',
  'pricing': 'Pricing',
  'about': 'About',
  'login': 'Sign In',
  'register': 'Sign Up',
  'forgot-password': 'Forgot Password',
  'ats': 'ATS',
  'dashboard': 'Dashboard',
  'jobs': 'Jobs',
  'settings': 'Settings',
  'onboarding': 'Onboarding',
  'features': 'Features',
  'examples': 'Examples',
  'terms': 'Terms of Service',
  'privacy': 'Privacy Policy',
};

export function Breadcrumbs({ items, className, showHome = true }: BreadcrumbsProps) {
  const location = useLocation();
  const { isNeoBrutalism } = useDesignMode();

  // Auto-generate breadcrumbs from path if items not provided
  const breadcrumbItems: BreadcrumbItem[] = items || (() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const generatedItems: BreadcrumbItem[] = [];

    pathParts.forEach((part, index) => {
      const href = '/' + pathParts.slice(0, index + 1).join('/');
      const label = pathLabels[part] || part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
      generatedItems.push({ label, href: index < pathParts.length - 1 ? href : undefined });
    });

    return generatedItems;
  })();

  if (breadcrumbItems.length === 0 && !showHome) {
    return null;
  }

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn(
        "flex items-center text-sm",
        isNeoBrutalism 
          ? "font-bold uppercase tracking-wide" 
          : "font-medium",
        className
      )}
    >
      <ol className="flex items-center flex-wrap gap-1">
        {showHome && (
          <li className="flex items-center">
            <Link
              to="/"
              className={cn(
                "flex items-center gap-1 transition-colors",
                isNeoBrutalism
                  ? "text-foreground hover:text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Home className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only">Home</span>
            </Link>
          </li>
        )}

        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight 
              className={cn(
                "h-4 w-4 mx-1",
                isNeoBrutalism ? "text-foreground" : "text-muted-foreground"
              )} 
            />
            {item.href ? (
              <Link
                to={item.href}
                className={cn(
                  "transition-colors",
                  isNeoBrutalism
                    ? "text-foreground hover:text-primary underline decoration-2 underline-offset-2"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span 
                className={cn(
                  isNeoBrutalism 
                    ? "text-primary font-black" 
                    : "text-foreground"
                )}
                aria-current="page"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
