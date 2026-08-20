import { Link } from 'react-router-dom';
import { useDesignMode } from '@/hooks/useDesignMode';
import { professions } from '@/data/professions';
import { BrandWordmark } from './BrandLogo';
import { brand } from '@/config/brand';

// A stable subset of profession pages, cross-linked from every page via the
// footer so crawlers can discover them without depending solely on the sitemap.
const FEATURED_PROFESSIONS = professions.slice(0, 10);

const Footer = () => {
  const { isNeoBrutalism } = useDesignMode();

  const footerSections = [
    {
      title: 'Make Your Resume',
      links: [
        { to: '/make-cv', label: 'Make CV Online' },
        { to: '/make-resume', label: 'Make Resume Online' },
        { to: '/cv-maker', label: 'Online CV Maker' },
        { to: '/resume-builder', label: 'AI Resume Builder' },
        { to: '/cover-letter-builder', label: 'Cover Letter Builder' },
        { to: '/templates', label: 'ATS Templates' },
        { to: '/examples', label: 'Example Resumes' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { to: '/blog', label: 'Blog & Guides' },
        { to: '/resources', label: 'Resume Resources' },
        { to: '/career-advice', label: 'Career Advice' },
        { to: '/pricing', label: 'Pricing Plans' },
        { to: '/features', label: 'All Features' },
        { to: '/help', label: 'Help Center' },
      ],
    },
    {
      title: 'Company',
      links: [
        { to: '/about', label: 'About MakeCV' },
        { to: '/login', label: 'Log In' },
        { to: '/privacy', label: 'Privacy Policy' },
        { to: '/terms', label: 'Terms of Use' },
        { to: '/refund-policy', label: 'Refund Policy' },
        { to: '/shipping-policy', label: 'Shipping Policy' },
      ],
    },
  ];

  if (isNeoBrutalism) {
    return (
      <footer className="bg-background border-t-4 border-foreground">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-1 sm:col-span-2 lg:col-span-2">
              <Link to="/" className="inline-flex items-center gap-2">
                <BrandWordmark className="h-8" textClassName="text-2xl font-bold uppercase tracking-wider" />
              </Link>
              <p className="mt-4 text-sm text-foreground font-medium">
                Make professional resumes and cover letters online in minutes.
              </p>
              <a
                href={brand.linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex text-sm font-bold text-foreground underline decoration-2 underline-offset-4 hover:text-primary"
                aria-label="Connect with Nishant Jha on LinkedIn"
              >
                Connect with Nishant Jha on LinkedIn
              </a>
            </div>
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-black uppercase tracking-widest text-foreground border-b-2 border-foreground pb-2 mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to} className="text-sm text-foreground font-bold uppercase tracking-wide hover:text-primary transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 pt-6 border-t-2 border-foreground">
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground mb-3">Resume Templates by Profession</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {FEATURED_PROFESSIONS.map((p) => (
                <Link key={p.slug} to={`/resume-template/${p.slug}`} className="text-xs font-bold uppercase tracking-wide text-foreground/70 hover:text-primary transition-colors">
                  {p.title.replace(' Resume Template', '')}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-8 border-t-2 border-foreground">
            <p className="text-sm text-center font-bold uppercase tracking-wide text-foreground">&copy; {new Date().getFullYear()} MakeCV. All rights reserved.</p>
          </div>
        </div>
      </footer>
    );
  }

  // Dark materialistic footer
  return (
    <footer className="bg-[hsl(var(--surface-dark))] border-t border-white/[0.06]">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2 mb-4">
            <Link to="/" className="mb-4" aria-label="MakeCV home">
              <BrandWordmark className="h-7" textClassName="text-lg font-semibold tracking-tight" />
            </Link>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              Make professional resumes and CVs online in minutes with AI-powered tools.
            </p>
            <a
              href={brand.linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex text-xs text-white/55 underline underline-offset-4 hover:text-white transition-colors"
              aria-label="Connect with Nishant Jha on LinkedIn"
            >
              Connect with Nishant Jha on LinkedIn
            </a>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-white/70 mb-4">{section.title}</h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-xs text-white/35 hover:text-white/70 transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-white/[0.06]">
          <h3 className="text-xs font-semibold text-white/70 mb-3">Resume Templates by Profession</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {FEATURED_PROFESSIONS.map((p) => (
              <Link
                key={p.slug}
                to={`/resume-template/${p.slug}`}
                className="text-xs text-white/35 hover:text-white/70 transition-colors duration-300"
              >
                {p.title.replace(' Resume Template', '')}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.06]">
          <p className="text-xs text-white/25 text-center">
            Copyright &copy; {new Date().getFullYear()} MakeCV. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
