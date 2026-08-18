import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Settings, LogOut, Shield, ChevronDown, FileText, Sparkles, LayoutTemplate, HelpCircle, Briefcase, DollarSign, BookOpen } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { useDesignMode } from '@/hooks/useDesignMode';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { NotificationBell } from './NotificationBell';
import { BrandWordmark } from './BrandLogo';

// Mobile menu rendered as a portal to document.body — avoids backdrop-filter
// stacking-context traps that prevent position:fixed children from covering the
// full viewport on Safari/WebKit mobile.
function MobileMenuPortal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  // Lock body scroll while menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[9998]"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
        className="fixed inset-y-0 right-0 z-[9999] w-full max-w-sm bg-background shadow-2xl overflow-y-auto"
        style={{ WebkitOverflowScrolling: 'touch' }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </>,
    document.body
  );
}

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { data: isAdmin } = useAdminStatus(user?.id);
  const { isNeoBrutalism } = useDesignMode();
  const location = useLocation();

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    setMobileMenuOpen(false);
    await signOut();
  };

  const getUserInitials = () => {
    if (!user || !user.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  const toolsItems = [
    { to: '/resume-builder', label: 'Resume Builder', icon: FileText },
    { to: '/cover-letter-builder', label: 'Cover Letters', icon: Sparkles },
    { to: '/master-profiles', label: 'Master Profiles', icon: User },
  ];

  const navItems = [
    { to: '/templates', label: 'Templates', icon: LayoutTemplate },
    { to: '/examples', label: 'Examples', icon: FileText },
    { to: '/blog', label: 'Blog', icon: BookOpen },
    { to: '/pricing', label: 'Pricing', icon: DollarSign },
    { to: '/ats', label: 'For Companies', icon: Briefcase },
    { to: '/help', label: 'Help', icon: HelpCircle },
  ];

  const isRouteActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(`${to}/`);
  const isBuildActive = toolsItems.some((item) => isRouteActive(item.to));

  // ─── NEO-BRUTALIST MOBILE MENU CONTENT ───────────────────────────────────
  const NeoBrutalistMobileMenu = (
    <MobileMenuPortal open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
      <div className="bg-background border-l-4 border-foreground h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b-2 border-foreground">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>
            <BrandWordmark className="h-8" textClassName="text-2xl font-bold uppercase tracking-wider" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="border-2 border-foreground p-2 min-h-[44px] min-w-[44px] flex items-center justify-center bg-background"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {user && (
          <div className="m-4 p-3 border-2 border-foreground bg-muted flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-bold truncate">{user.email}</p>
              {isAdmin && <span className="text-[10px] text-destructive font-black uppercase">Admin</span>}
            </div>
            <Link to="/account" onClick={() => setMobileMenuOpen(false)}>
              <Button size="sm" variant="outline" className="text-xs rounded-none border-2 border-foreground font-bold uppercase">Account</Button>
            </Link>
          </div>
        )}

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-black pt-2 pb-1">Build</p>
          {toolsItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 uppercase tracking-wide font-bold text-base py-3 border-b border-border/30 ${isRouteActive(to) ? 'text-primary' : 'text-foreground hover:text-primary'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}

          <p className="text-xs uppercase tracking-widest text-muted-foreground font-black pt-4 pb-1">Explore</p>
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 uppercase tracking-wide font-bold text-base py-3 border-b border-border/30 ${isRouteActive(to) ? 'text-primary' : 'text-foreground hover:text-primary'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 space-y-2 border-t-2 border-foreground">
          {user ? (
            <>
              <Link to="/account/settings" className="block w-full" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full rounded-none border-2 border-foreground font-bold uppercase justify-start">
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/admin" className="block w-full" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full rounded-none border-2 border-foreground font-bold uppercase text-destructive justify-start">
                    <Shield className="mr-2 h-4 w-4" /> Admin
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                className="w-full rounded-none border-2 border-foreground font-bold uppercase justify-start text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </Button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link to="/login" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full rounded-none border-2 border-foreground font-bold uppercase">Sign in</Button>
              </Link>
              <Link to="/register" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full rounded-none border-2 border-foreground font-bold uppercase">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </MobileMenuPortal>
  );

  // ─── APPLE-STYLE MOBILE MENU CONTENT ─────────────────────────────────────
  const AppleMobileMenu = (
    <MobileMenuPortal open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
      <div className="bg-background/98 backdrop-blur-2xl h-full flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} aria-label="MakeCV home">
            <BrandWordmark className="h-7" textClassName="text-xl font-semibold tracking-tight" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="h-10 w-10 rounded-full flex items-center justify-center bg-muted/60 text-foreground/70 hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {user && (
          <div className="mx-4 mt-4 p-3 rounded-2xl bg-muted/60 border border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{user.email}</p>
                {isAdmin && <span className="text-[10px] text-destructive font-medium uppercase tracking-wider">Admin</span>}
              </div>
            </div>
            <Link to="/account" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" size="sm" className="text-xs h-8 rounded-full">Account</Button>
            </Link>
          </div>
        )}

        <nav className="flex-1 px-5 py-4 overflow-y-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground pb-1">Document Builders</p>
          {toolsItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 py-3.5 text-lg font-medium transition-colors border-b border-border/20 ${isRouteActive(to) ? 'text-primary' : 'text-foreground hover:text-primary'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Icon className="h-4 w-4" />
              </div>
              {label}
            </Link>
          ))}

          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground pt-5 pb-1">Explore</p>
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 py-3.5 text-lg font-medium transition-colors border-b border-border/20 ${isRouteActive(to) ? 'text-primary' : 'text-foreground hover:text-primary'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                <Icon className="h-4 w-4" />
              </div>
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-5 pt-3 space-y-2 border-t border-border/30">
          {user ? (
            <>
              <Link to="/account/settings" className="block w-full" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full h-11 rounded-xl text-sm font-medium justify-start">
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/admin" className="block w-full" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full h-11 rounded-xl text-sm font-medium text-destructive justify-start">
                    <Shield className="mr-2 h-4 w-4" /> Admin
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                className="w-full h-11 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 justify-start"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </Button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Link to="/register" className="block w-full" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full h-11 rounded-full text-sm font-medium">Get Started Free</Button>
              </Link>
              <Link to="/login" className="block w-full" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full h-11 rounded-full text-sm font-medium">Sign in</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </MobileMenuPortal>
  );

  if (isNeoBrutalism) {
    return (
      <>
        {NeoBrutalistMobileMenu}
        <header className="sticky top-0 z-40 bg-background border-b-4 border-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <BrandWordmark className="h-8" textClassName="text-2xl font-bold uppercase tracking-wider" />
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex md:items-center md:space-x-6">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={`flex items-center gap-1 uppercase tracking-wide font-bold text-xs outline-none ${isBuildActive ? 'text-primary' : 'text-foreground hover:text-primary'}`}
                  >
                    Build <ChevronDown className="h-3 w-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-52 border-3 border-foreground rounded-none shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
                    {toolsItems.map(({ to, label }) => (
                      <DropdownMenuItem key={to} asChild>
                        <Link to={to} className={`cursor-pointer font-bold uppercase text-xs ${isRouteActive(to) ? 'text-primary' : ''}`}>{label}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {navItems.map(({ to, label }) => (
                  <Link key={to} to={to} className={`uppercase tracking-wide font-bold text-xs ${isRouteActive(to) ? 'text-primary' : 'text-foreground hover:text-primary'}`}>
                    {label}
                  </Link>
                ))}
              </nav>

              {/* Desktop Auth */}
              <div className="hidden md:flex md:items-center md:space-x-3">
                <ThemeToggle />
                {user && <NotificationBell />}
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full border-2 border-foreground">
                        <Avatar className="h-8 w-8 border-2 border-foreground">
                          <AvatarFallback className="bg-primary text-primary-foreground font-bold">{getUserInitials()}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 border-3 border-foreground rounded-none shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
                      <div className="p-2"><p className="font-bold truncate">{user.email}</p>{isAdmin && <Badge variant="destructive" className="text-xs w-fit rounded-none border-2 border-foreground"><Shield className="w-3 h-3 mr-1" />Admin</Badge>}</div>
                      <DropdownMenuSeparator className="bg-foreground h-0.5" />
                      <DropdownMenuItem asChild><Link to="/account" className="flex cursor-pointer items-center"><User className="mr-2 h-4 w-4" /><span>My Account</span></Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link to="/account/settings" className="flex cursor-pointer items-center"><Settings className="mr-2 h-4 w-4" /><span>Settings</span></Link></DropdownMenuItem>
                      {isAdmin && (<><DropdownMenuSeparator className="bg-foreground h-0.5" /><DropdownMenuItem asChild><Link to="/admin" className="flex cursor-pointer items-center"><Shield className="mr-2 h-4 w-4" /><span>Admin</span></Link></DropdownMenuItem></>)}
                      <DropdownMenuSeparator className="bg-foreground h-0.5" />
                      <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer"><LogOut className="mr-2 h-4 w-4" /><span>Sign out</span></DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Link to="/login"><Button variant="outline" size="sm" className="rounded-none border-2 border-foreground font-bold uppercase shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">Sign in</Button></Link>
                    <Link to="/register"><Button size="sm" className="rounded-none border-2 border-foreground font-bold uppercase shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">Sign up</Button></Link>
                  </>
                )}
              </div>

              {/* Mobile Hamburger */}
              <div className="flex md:hidden items-center gap-2">
                <ThemeToggle />
                {user && <NotificationBell />}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="border-2 border-foreground p-2 min-h-[44px] min-w-[44px] flex items-center justify-center bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Open mobile menu"
                  aria-expanded={mobileMenuOpen}
                  data-testid="mobile-menu-trigger"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </header>
      </>
    );
  }

  // Apple-inspired default design
  return (
    <>
      {AppleMobileMenu}
      <header className="sticky top-0 z-40 apple-nav">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-12 items-center justify-between">
            <Link to="/" className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded" aria-label="MakeCV home">
              <BrandWordmark className="h-7" textClassName="text-xl font-semibold tracking-apple-tight" />
              <span className="sr-only">MakeCV - AI-powered resume builder</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex md:items-center md:space-x-7" role="navigation" aria-label="Main navigation">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={`flex items-center gap-1 text-xs font-normal transition-colors duration-300 outline-none ${isBuildActive ? 'text-foreground' : 'text-foreground/80 hover:text-foreground'}`}
                  aria-label="Build menu"
                >
                  Build <ChevronDown className="h-3 w-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 z-50 rounded-xl border border-border/50 shadow-lg bg-background/95 backdrop-blur-xl">
                  {toolsItems.map(({ to, label }) => (
                    <DropdownMenuItem key={to} asChild>
                      <Link to={to} className={`cursor-pointer ${isRouteActive(to) ? 'font-medium text-foreground' : ''}`}>{label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {navItems.map(({ to, label }) => (
                <Link key={to} to={to} className={`text-xs font-normal transition-colors duration-300 ${isRouteActive(to) ? 'text-foreground' : 'text-foreground/80 hover:text-foreground'}`}>
                  {label}
                </Link>
              ))}
            </nav>

            {/* Desktop Auth */}
            <div className="hidden md:flex md:items-center md:space-x-3">
              <ThemeToggle />
              {user && <NotificationBell />}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" aria-label={`User menu for ${user.email}`}>
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs bg-muted text-muted-foreground font-medium">{getUserInitials()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 z-50 rounded-xl border border-border/50 shadow-lg bg-background/95 backdrop-blur-xl">
                    <div className="p-3">
                      <p className="text-sm font-medium truncate">{user.email}</p>
                      {isAdmin && <Badge variant="destructive" className="text-xs w-fit mt-1"><Shield className="w-3 h-3 mr-1" />Admin</Badge>}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link to="/account" className="flex cursor-pointer items-center"><User className="mr-2 h-4 w-4" /><span>My Account</span></Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/account/settings" className="flex cursor-pointer items-center"><Settings className="mr-2 h-4 w-4" /><span>Settings</span></Link></DropdownMenuItem>
                    {isAdmin && (<><DropdownMenuSeparator /><DropdownMenuItem asChild><Link to="/admin" className="flex cursor-pointer items-center"><Shield className="mr-2 h-4 w-4" /><span>Admin</span></Link></DropdownMenuItem></>)}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer"><LogOut className="mr-2 h-4 w-4" /><span>Sign out</span></DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="text-xs font-normal h-8 px-3 text-foreground/80 hover:text-foreground hover:bg-transparent">Sign in</Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="text-xs font-normal h-7 px-3.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">Get Started</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger */}
            <div className="flex md:hidden items-center gap-1.5">
              <ThemeToggle />
              {user && <NotificationBell />}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="inline-flex items-center justify-center rounded-lg p-2 text-foreground/80 hover:text-foreground hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px] min-w-[44px]"
                aria-label="Open main menu"
                aria-expanded={mobileMenuOpen}
                data-testid="mobile-menu-trigger"
              >
                <Menu className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
