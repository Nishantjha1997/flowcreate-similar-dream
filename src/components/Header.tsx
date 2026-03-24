
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MenuIcon, X, User, Settings, LogOut, Shield } from 'lucide-react';
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

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { data: isAdmin } = useAdminStatus(user?.id);
  const { isNeoBrutalism } = useDesignMode();
  
  const handleSignOut = async () => {
    await signOut();
  };

  const getUserInitials = () => {
    if (!user || !user.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  const navItems = [
    { to: '/templates', label: 'Templates' },
    { to: '/account', label: 'Profile' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/ats', label: 'For Companies' },
    { to: '/about', label: 'About' }
  ];

  if (isNeoBrutalism) {
    return (
      <header className="sticky top-0 z-50 bg-background border-b-4 border-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold uppercase tracking-wider text-primary">Flow</span>
              <span className="text-2xl font-bold uppercase tracking-wider text-foreground">Create</span>
            </Link>
            <nav className="hidden md:flex md:items-center md:space-x-6">
              {navItems.map(({ to, label }) => (
                <Link key={to} to={to} className="uppercase tracking-wide text-foreground hover:text-primary font-bold text-xs">
                  {label}
                </Link>
              ))}
            </nav>
            <div className="hidden md:flex md:items-center md:space-x-3">
              <ThemeToggle />
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
                        <p className="font-bold">{user.email}</p>
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
              <button onClick={() => setMobileMenuOpen(true)} className="border-2 border-foreground p-2"><MenuIcon className="h-5 w-5" /></button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-background px-4">
            <div className="flex h-16 items-center justify-between">
              <Link to="/"><span className="text-2xl font-bold uppercase tracking-wider text-primary">Flow</span><span className="text-2xl font-bold uppercase tracking-wider text-foreground">Create</span></Link>
              <button onClick={() => setMobileMenuOpen(false)} className="border-2 border-foreground p-2"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-6 space-y-6 py-6">
              {navItems.map(({ to, label }) => (<Link key={to} to={to} className="block uppercase tracking-wide text-foreground font-bold hover:text-primary" onClick={() => setMobileMenuOpen(false)}>{label}</Link>))}
            </div>
            <div className="mt-6 space-y-2">
              {!user && (<><Link to="/login" className="block w-full" onClick={() => setMobileMenuOpen(false)}><Button variant="outline" className="w-full rounded-none border-2 border-foreground font-bold uppercase">Sign in</Button></Link><Link to="/register" className="block w-full" onClick={() => setMobileMenuOpen(false)}><Button className="w-full rounded-none border-2 border-foreground font-bold uppercase">Sign up</Button></Link></>)}
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
            <Link to="/" className="flex items-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
              <span className="text-xl font-semibold tracking-apple-tight text-foreground">FlowCreate</span>
              <span className="sr-only">FlowCreate - AI-powered resume builder</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex md:items-center md:space-x-7" role="navigation" aria-label="Main navigation">
            {navItems.map(({ to, label }) => (
              <Link 
                key={to}
                to={to} 
                className="text-xs font-normal text-foreground/80 hover:text-foreground transition-colors duration-300"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex md:items-center md:space-x-3">
            <ThemeToggle />
            
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
                      <p className="text-sm font-medium">{user.email}</p>
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
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl border border-border/50 shadow-lg bg-background/95 backdrop-blur-xl">
                  <div className="p-2"><p className="text-sm font-medium">{user.email}</p></div>
                  <DropdownMenuItem asChild><Link to="/account" className="flex cursor-pointer items-center" onClick={() => setMobileMenuOpen(false)}><User className="mr-2 h-4 w-4" /><span>My Account</span></Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/account/settings" className="flex cursor-pointer items-center" onClick={() => setMobileMenuOpen(false)}><Settings className="mr-2 h-4 w-4" /><span>Settings</span></Link></DropdownMenuItem>
                  {isAdmin && (<><DropdownMenuSeparator /><DropdownMenuItem asChild><Link to="/admin" className="flex cursor-pointer items-center" onClick={() => setMobileMenuOpen(false)}><Shield className="mr-2 h-4 w-4" /><span>Admin Dashboard</span></Link></DropdownMenuItem></>)}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer"><LogOut className="mr-2 h-4 w-4" /><span>Sign out</span></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-foreground/80"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open main menu"
              >
                <MenuIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu - Apple style */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-background/95 backdrop-blur-xl">
          <div className="px-4 sm:px-6">
            <div className="flex h-12 items-center justify-between">
              <Link to="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                <span className="text-xl font-semibold tracking-apple-tight text-foreground">FlowCreate</span>
              </Link>
              <button
                type="button"
                className="rounded-md p-2 text-foreground/80"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-8 flow-root">
              <div className="space-y-1">
                {navItems.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className="block py-3 text-2xl font-semibold text-foreground tracking-apple-tight hover:text-primary transition-colors border-b border-border/30"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
              </div>
              <div className="mt-8 space-y-3">
                {!user && (
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
