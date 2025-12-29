
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

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user || !user.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <header className={`sticky top-0 z-50 ${
      isNeoBrutalism 
        ? 'bg-background border-b-4 border-foreground' 
        : 'border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
              <span className={`text-2xl font-bold ${isNeoBrutalism ? 'uppercase tracking-wider' : ''} text-primary`}>Flow</span>
              <span className={`text-2xl font-bold ${isNeoBrutalism ? 'uppercase tracking-wider' : ''} text-foreground`}>Create</span>
              <span className="sr-only">FlowCreate - AI-powered resume builder</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex md:items-center md:space-x-6" role="navigation" aria-label="Main navigation">
            {[
              { to: '/templates', label: 'Templates' },
              { to: '/account', label: 'Profile' },
              { to: '/pricing', label: 'Pricing' },
              { to: '/ats', label: 'For Companies' },
              { to: '/about', label: 'About' }
            ].map(({ to, label }) => (
              <Link 
                key={to}
                to={to} 
                className={`text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded ${
                  isNeoBrutalism 
                    ? 'uppercase tracking-wide text-foreground hover:text-primary font-bold' 
                    : 'text-foreground/70 hover:text-foreground'
                }`}
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
                    className={`rounded-full focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      isNeoBrutalism ? 'border-2 border-foreground' : ''
                    }`}
                    aria-label={`User menu for ${user.email}`}
                  >
                    <Avatar className={`h-8 w-8 ${isNeoBrutalism ? 'border-2 border-foreground' : ''}`}>
                      <AvatarFallback className={isNeoBrutalism ? 'bg-primary text-primary-foreground font-bold' : ''}>
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className={`w-56 z-50 ${
                    isNeoBrutalism 
                      ? 'border-3 border-foreground rounded-none shadow-[4px_4px_0px_0px_hsl(var(--foreground))]' 
                      : 'bg-background border shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className={`font-medium ${isNeoBrutalism ? 'font-bold' : ''}`}>{user.email}</p>
                      {isAdmin && (
                        <Badge 
                          variant="destructive" 
                          className={`text-xs w-fit ${isNeoBrutalism ? 'rounded-none border-2 border-foreground' : ''}`}
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator className={isNeoBrutalism ? 'bg-foreground h-0.5' : ''} />
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
                      <DropdownMenuSeparator className={isNeoBrutalism ? 'bg-foreground h-0.5' : ''} />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex cursor-pointer items-center">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className={isNeoBrutalism ? 'bg-foreground h-0.5' : ''} />
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
                    variant="outline" 
                    size="sm"
                    className={`focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      isNeoBrutalism 
                        ? 'rounded-none border-2 border-foreground font-bold uppercase shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all' 
                        : ''
                    }`}
                  >
                    Sign in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    size="sm"
                    className={`focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      isNeoBrutalism 
                        ? 'rounded-none border-2 border-foreground font-bold uppercase shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all' 
                        : ''
                    }`}
                  >
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex md:hidden">
            <ThemeToggle />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={`ml-2 rounded-full ${isNeoBrutalism ? 'border-2 border-foreground' : ''}`}>
                    <Avatar className={`h-8 w-8 ${isNeoBrutalism ? 'border-2 border-foreground' : ''}`}>
                      <AvatarFallback className={isNeoBrutalism ? 'bg-primary text-primary-foreground font-bold' : ''}>
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className={`w-56 ${isNeoBrutalism ? 'border-3 border-foreground rounded-none shadow-[4px_4px_0px_0px_hsl(var(--foreground))]' : ''}`}
                >
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className={`font-medium ${isNeoBrutalism ? 'font-bold' : ''}`}>{user.email}</p>
                      {isAdmin && (
                        <Badge variant="destructive" className={`text-xs w-fit ${isNeoBrutalism ? 'rounded-none border-2 border-foreground' : ''}`}>
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="flex cursor-pointer items-center" onClick={() => setMobileMenuOpen(false)}>
                      <User className="mr-2 h-4 w-4" />
                      <span>My Account</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account/settings" className="flex cursor-pointer items-center" onClick={() => setMobileMenuOpen(false)}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator className={isNeoBrutalism ? 'bg-foreground h-0.5' : ''} />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex cursor-pointer items-center" onClick={() => setMobileMenuOpen(false)}>
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                type="button"
                className={`ml-2 -m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  isNeoBrutalism ? 'border-2 border-foreground' : ''
                }`}
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open main menu"
                aria-expanded="false"
              >
                <MenuIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className={`fixed inset-0 z-50 md:hidden ${isNeoBrutalism ? 'bg-background' : 'bg-background'}`}>
          <div className="fixed inset-0 z-50 overflow-y-auto bg-background px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <Link to="/" className="flex items-center">
                  <span className={`text-2xl font-bold ${isNeoBrutalism ? 'uppercase tracking-wider' : ''} text-primary`}>Flow</span>
                  <span className={`text-2xl font-bold ${isNeoBrutalism ? 'uppercase tracking-wider' : ''} text-foreground`}>Create</span>
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <button
                  type="button"
                  className={`-m-2.5 rounded-md p-2.5 text-foreground ${isNeoBrutalism ? 'border-2 border-foreground' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="mt-6 flow-root">
              <div className="space-y-6 py-6">
                {[
                  { to: '/templates', label: 'Templates' },
                  { to: '/account', label: 'Profile' },
                  { to: '/pricing', label: 'Pricing' },
                  { to: '/ats', label: 'For Companies' },
                  { to: '/about', label: 'About' }
                ].map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`block text-base font-medium ${
                      isNeoBrutalism 
                        ? 'uppercase tracking-wide text-foreground font-bold hover:text-primary' 
                        : 'text-foreground/70 hover:text-foreground'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
              </div>
              <div className="mt-6 space-y-2">
                {user ? (
                  <Button 
                    onClick={handleSignOut} 
                    className={`w-full ${
                      isNeoBrutalism 
                        ? 'rounded-none border-2 border-foreground font-bold uppercase shadow-[3px_3px_0px_0px_hsl(var(--foreground))]' 
                        : ''
                    }`}
                  >
                    Sign out
                  </Button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block w-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button 
                        variant="outline" 
                        className={`w-full ${
                          isNeoBrutalism 
                            ? 'rounded-none border-2 border-foreground font-bold uppercase shadow-[3px_3px_0px_0px_hsl(var(--foreground))]' 
                            : ''
                        }`}
                      >
                        Sign in
                      </Button>
                    </Link>
                    <Link
                      to="/register"
                      className="block w-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button 
                        className={`w-full ${
                          isNeoBrutalism 
                            ? 'rounded-none border-2 border-foreground font-bold uppercase shadow-[3px_3px_0px_0px_hsl(var(--foreground))]' 
                            : ''
                        }`}
                      >
                        Sign up
                      </Button>
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
