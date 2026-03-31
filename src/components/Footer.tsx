import { Link } from 'react-router-dom';
import { useDesignMode } from '@/hooks/useDesignMode';

const Footer = () => {
  const { isNeoBrutalism } = useDesignMode();

  if (isNeoBrutalism) {
    return (
      <footer className="bg-background border-t-4 border-foreground">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-1 sm:col-span-2 lg:col-span-2">
              <Link to="/"><span className="text-2xl font-bold uppercase tracking-wider text-primary">Flow</span><span className="text-2xl font-bold uppercase tracking-wider text-foreground">Create</span></Link>
              <p className="mt-4 text-sm text-foreground font-medium">Create professional resumes and cover letters online in minutes.</p>
            </div>
            {[
              { title: 'Product', links: [{ to: '/templates', label: 'Templates' }, { to: '/examples', label: 'Examples' }, { to: '/features', label: 'Features' }, { to: '/pricing', label: 'Pricing' }] },
              { title: 'Resources', links: [{ to: '/blog', label: 'Blog' }, { to: '/help', label: 'Help Center' }, { to: '/career-advice', label: 'Career Advice' }] },
              { title: 'Company', links: [{ to: '/about', label: 'About' }, { to: '/privacy', label: 'Privacy' }, { to: '/terms', label: 'Terms' }, { to: '/shipping-policy', label: 'Shipping Policy' }] },
            ].map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-black uppercase tracking-widest text-foreground border-b-2 border-foreground pb-2 mb-4">{section.title}</h3>
                <ul className="space-y-2">{section.links.map((link) => (<li key={link.to}><Link to={link.to} className="text-sm text-foreground font-bold uppercase tracking-wide hover:text-primary transition-colors">{link.label}</Link></li>))}</ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t-2 border-foreground">
            <p className="text-sm text-center font-bold uppercase tracking-wide text-foreground">&copy; {new Date().getFullYear()} FlowCreate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    );
  }

  // Dark materialistic footer
  const footerSections = [
    { title: 'Product', links: [{ to: '/templates', label: 'Templates' }, { to: '/examples', label: 'Example Resumes' }, { to: '/features', label: 'Features' }, { to: '/pricing', label: 'Pricing' }] },
    { title: 'Resources', links: [{ to: '/blog', label: 'Blog' }, { to: '/help', label: 'Help Center' }, { to: '/career-advice', label: 'Career Advice' }] },
    { title: 'Company', links: [{ to: '/about', label: 'About' }, { to: '/privacy', label: 'Privacy Policy' }, { to: '/terms', label: 'Terms of Use' }, { to: '/shipping-policy', label: 'Shipping Policy' }] }
  ];

  return (
    <footer className="bg-[hsl(var(--surface-dark))] border-t border-white/[0.06]">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2 mb-4">
            <Link to="/" className="inline-block mb-4">
              <span className="text-lg font-semibold tracking-tight text-white">FlowCreate</span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              Create professional resumes and cover letters online in minutes with AI-powered tools.
            </p>
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
        
        <div className="mt-12 pt-6 border-t border-white/[0.06]">
          <p className="text-xs text-white/25 text-center">
            Copyright &copy; {new Date().getFullYear()} FlowCreate. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
