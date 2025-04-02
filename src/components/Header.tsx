
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MenuIcon, X, User, Settings, LogOut } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
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
  
  const handleSignOut = async () => {
    await signOut();
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user || !user.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

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
            <Link to="/examples" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
              Examples
            </Link>
            <Link to="/features" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
              Features
            </Link>
            <Link to="/pricing" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
              Pricing
            </Link>
            <Link to="/about" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
              About
            </Link>
          </nav>

          <div className="hidden md:flex md:items-center md:space-x-3">
            <ThemeToggle />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.email}</p>
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
                  <Button variant="outline" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
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
                  <Button variant="ghost" size="icon" className="ml-2 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.email}</p>
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
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                type="button"
                className="ml-2 -m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">Open main menu</span>
                <MenuIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            )}
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
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5 text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
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
                  to="/examples"
                  className="block text-base font-medium text-foreground/70 hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Examples
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
                  to="/about"
                  className="block text-base font-medium text-foreground/70 hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
              </div>
              <div className="mt-6 space-y-2">
                {user ? (
                  <Button onClick={handleSignOut} className="w-full">
                    Sign out
                  </Button>
                ) : (
                  <>
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
