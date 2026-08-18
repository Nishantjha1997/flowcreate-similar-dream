import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { MenuIcon, X, User, Settings, LogOut, Shield, ChevronDown } from 'lucide-react';
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

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { data: isAdmin } = useAdminStatus(user?.id);
  const { isNeoBrutalism } = useDesignMode();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const getUserInitials = () => {
    if (!user || !user.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  // "Build" groups the actual document builders
  const toolsItems = [
    { to: '/resume-builder', label: 'Resume Builder' },
    { to: '/cover-letter-builder', label: 'Cover Letters' },
    { to: '/master-profiles', label: 'Master Profiles' },
  ];

  const navItems = [
    { to: '/templates', label: 'Templates' },
    { to: '/blog', label: 'Blog' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/ats', label: 'For Companies' },
    { to: '/help', label: 'Help' },
  ];

  const isRouteActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(`${to}/`);
  const isBuildActive = toolsItems.some((item) => isRouteActive(item.to));

  if (isNeoBrutalism) {
    return (
      <header className="sticky top-0 z-50 bg-background border-b-4 border-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <BrandWordmark className="h-8" textClassName="text-2xl font-bold uppercase tracking-wider" />
            </Link>
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
                      <Link to={to} className={`cursor-pointer font-bold uppercase text-xs ${isRouteActive(to) ? 'text-primary' : ''}`}>
                        {label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {navItems.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`uppercase tracking-wide font-bold text-xs ${isRouteActive(to) ? 'text-primary' : 'text-foreground hover:text-primary'}`}
                >
                  {label}
                </Link>
              ))}
            </nav>
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
                    <div className="flex items-center gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-bold truncate">{user.email}</p>
                        {isAdmin && <Badge variant="destructive" className="text-xs w-fit rounded-none border-2 border-foreground"><Shield className="w-3 h-3 mr-1" />Admin</Badge>}
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-foreground h-0.5" />
                    <DropdownMenuItem asChild><Link to="/account" className="flex cursor-pointer items-center"><User className="mr-2 h-4 w-4" /><span>My Account</span></Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/account/settings" className="flex cursor-pointer items-center"><Settings className="mr-2 h-4 w-4" /><span>Settings</span></Link></DropdownMenuItem>
                    {isAdmin && (<><DropdownMenuSeparator className="bg-foreground h-0.5" /><DropdownMenuItem asChild><Link to="/admin" className="flex cursor-pointer items-center"><Shield className="mr-2 h-4 w-4" /><span>Admin Dashboard</span></Link></DropdownMenuItem></>)}
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
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              {user && <NotificationBell />}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full border-2 border-foreground h-8 w-8">
                      <Avatar className="h-7 w-7 border border-foreground">
                        <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">{getUserInitials()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 border-3 border-foreground rounded-none shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
                    <div className="p-2"><p className="text-xs font-bold truncate">{user.email}</p></div>
                    <DropdownMenuItem asChild><Link to="/account" className="flex cursor-pointer items-center"><User className="mr-2 h-4 w-4" /><span>My Account</span></Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/account/settings" className="flex cursor-pointer items-center"><Settings className="mr-2 h-4 w-4" /><span>Settings</span></Link></DropdownMenuItem>
                    {isAdmin && (<><DropdownMenuSeparator className="bg-foreground h-0.5" /><DropdownMenuItem asChild><Link to="/admin" className="flex cursor-pointer items-center"><Shield className="mr-2 h-4 w-4" /><span>Admin Dashboard</span></Link></DropdownMenuItem></>)}
                    <DropdownMenuSeparator className="bg-foreground h-0.5" />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer"><LogOut className="mr-2 h-4 w-4" /><span>Sign out</span></DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <button 
                onClick={() => setMobileMenuOpen(true)} 
                className="border-2 border-foreground p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Open menu"
              >
                <MenuIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-background px-4 overflow-y-auto">
            <div className="flex h-16 items-center justify-between">
              <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <BrandWordmark className="h-8" textClassName="text-2xl font-bold uppercase tracking-wider" />
              </Link>
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="border-2 border-foreground p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {user && (
              <div className="mt-4 p-3 border-2 border-foreground bg-muted flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-bold truncate">{user.email}</p>
                  {isAdmin && <span className="text-[10px] text-destructive font-black uppercase">Admin</span>}
                </div>
                <Link to="/account" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" variant="outline" className="text-xs rounded-none border-2 border-foreground font-bold uppercase">Account</Button>
                </Link>
              </div>
            )}
            <div className="mt-6 space-y-6 py-4">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-black">Build</p>
                {toolsItems.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`block uppercase tracking-wide font-bold text-lg ${isRouteActive(to) ? 'text-primary' : 'text-foreground hover:text-primary'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
              </div>
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-black">Explore</p>
                {navItems.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`block uppercase tracking-wide font-bold text-lg ${isRouteActive(to) ? 'text-primary' : 'text-foreground hover:text-primary'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-4 space-y-2 pb-8">
              {user ? (
                <>
                  <Link to="/account/settings" className="block w-full" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-none border-2 border-foreground font-bold uppercase">Settings</Button>
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="block w-full" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full rounded-none border-2 border-foreground font-bold uppercase text-destructive">Admin Dashboard</Button>
                    </Link>
                  )}
                  <Button 
                    variant="ghost" 
                    className="w-full rounded-none border-2 border-foreground font-bold uppercase"
                    onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block w-full" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-none border-2 border-foreground font-bold uppercase">Sign in</Button>
                  </Link>
                  <Link to="/register" className="block w-full" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full rounded-none border-2 border-foreground font-bold uppercase">Sign up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    );
  }

  // Apple-inspired default design
  return (
    <header className="sticky top-0 z-50 apple-nav">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-12 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded" aria-label="MakeCV home">
              <BrandWordmark className="h-7" textClassName="text-xl font-semibold tracking-apple-tight" />
              <span className="sr-only">MakeCV - AI-powered resume builder</span>
            </Link>
          </div>
          
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
                    <Link to={to} className={`cursor-pointer ${isRouteActive(to) ? 'font-medium text-foreground' : ''}`}>
                      {label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {navItems.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`text-xs font-normal transition-colors duration-300 ${isRouteActive(to) ? 'text-foreground' : 'text-foreground/80 hover:text-foreground'}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex md:items-center md:space-x-3">
            <ThemeToggle />
            {user && <NotificationBell />}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full h-8 w-8"
                    aria-label={`User menu for ${user.email}`}
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 z-50 rounded-xl border border-border/50 shadow-lg bg-background/95 backdrop-blur-xl"
                >
                  <div className="flex items-center justify-start gap-2 p-3">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="text-sm font-medium truncate">{user.email}</p>
                      {isAdmin && (
                        <Badge variant="destructive" className="text-xs w-fit">
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="flex cursor-pointer items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>My Account</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account/settings" className="flex cursor-pointer items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex cursor-pointer items-center">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-xs font-normal h-8 px-3 text-foreground/80 hover:text-foreground hover:bg-transparent"
                  >
                    Sign in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    size="sm"
                    className="text-xs font-normal h-7 px-3.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            {user && <NotificationBell />}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" aria-label={`User menu for ${user.email}`}>
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl border border-border/50 shadow-lg bg-background/95 backdrop-blur-xl">
                  <div className="p-2"><p className="text-sm font-medium truncate">{user.email}</p></div>
                  <DropdownMenuItem asChild><Link to="/account" className="flex cursor-pointer items-center" onClick={() => setMobileMenuOpen(false)}><User className="mr-2 h-4 w-4" /><span>My Account</span></Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/account/settings" className="flex cursor-pointer items-center" onClick={() => setMobileMenuOpen(false)}><Settings className="mr-2 h-4 w-4" /><span>Settings</span></Link></DropdownMenuItem>
                  {isAdmin && (<><DropdownMenuSeparator /><DropdownMenuItem asChild><Link to="/admin" className="flex cursor-pointer items-center" onClick={() => setMobileMenuOpen(false)}><Shield className="mr-2 h-4 w-4" /><span>Admin Dashboard</span></Link></DropdownMenuItem></>)}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer"><LogOut className="mr-2 h-4 w-4" /><span>Sign out</span></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-foreground/80 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] min-w-[44px]"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open main menu"
            >
              <MenuIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - Apple style */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-background/95 backdrop-blur-xl overflow-y-auto">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex h-12 items-center justify-between">
              <Link to="/" className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded" onClick={() => setMobileMenuOpen(false)} aria-label="MakeCV home">
                <BrandWordmark className="h-7" textClassName="text-xl font-semibold tracking-apple-tight" />
              </Link>
              <button
                type="button"
                className="rounded-md p-2 text-foreground/80 hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              {user && (
                <div className="mb-6 p-3 rounded-xl bg-muted/50 border border-border/40 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate text-foreground">{user.email}</p>
                      {isAdmin && <span className="text-[10px] text-destructive font-medium uppercase tracking-wider">Admin</span>}
                    </div>
                  </div>
                  <Link to="/account" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="text-xs h-8">Account</Button>
                  </Link>
                </div>
              )}
              <div className="space-y-1">
                <p className="pt-1 pb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Build</p>
                {toolsItems.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`block py-3 text-xl font-semibold tracking-apple-tight transition-colors border-b border-border/30 ${isRouteActive(to) ? 'text-primary' : 'text-foreground hover:text-primary'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
                <p className="pt-4 pb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Explore</p>
                {navItems.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`block py-3 text-xl font-semibold tracking-apple-tight transition-colors border-b border-border/30 ${isRouteActive(to) ? 'text-primary' : 'text-foreground hover:text-primary'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
              </div>
              <div className="mt-8 space-y-3 pb-8">
                {user ? (
                  <div className="space-y-2">
                    <Link to="/account/settings" className="block w-full" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full h-11 rounded-xl text-sm font-medium">Settings</Button>
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="block w-full" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full h-11 rounded-xl text-sm font-medium text-destructive">Admin Dashboard</Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full h-11 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground"
                      onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Sign out
                    </Button>
                  </div>
                ) : (
                  <>
                    <Link to="/login" className="block w-full" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full h-12 rounded-xl text-base">Sign in</Button>
                    </Link>
                    <Link to="/register" className="block w-full" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full h-12 rounded-xl text-base">Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
