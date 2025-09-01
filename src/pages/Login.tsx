import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAuth();

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    return newErrors;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        // Handle specific Supabase errors
        if (error.message.includes('Invalid login credentials')) {
          setErrors({ general: 'Invalid email or password. Please check your credentials and try again.' });
        } else if (error.message.includes('Email not confirmed')) {
          setErrors({ general: 'Please check your email and click the confirmation link before signing in.' });
        } else if (error.message.includes('Too many requests')) {
          setErrors({ general: 'Too many login attempts. Please wait a few minutes before trying again.' });
        } else {
          setErrors({ general: error.message || 'An error occurred during login' });
        }
        return;
      }
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in",
      });
      
      navigate('/resume-builder');
    } catch (error: any) {
      setErrors({ general: error.message || "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrors({});
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/resume-builder`,
        },
      });
      if (error) {
        setErrors({ general: error.message });
      }
    } catch (error: any) {
      setErrors({ general: error.message || 'Google login failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-card rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="mt-6 text-3xl font-extrabold text-foreground">
            Sign in to your account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Or{" "}
            <Link
              to="/register"
              className="font-medium text-primary hover:text-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              create a new account
            </Link>
          </p>
        </div>
        
        {errors.general && (
          <Alert variant="destructive">
            <AlertDescription>{errors.general}</AlertDescription>
          </Alert>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin} noValidate>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="sr-only">Email address</Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors(prev => ({ ...prev, email: undefined }));
                    }
                  }}
                  className={`pl-10 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  required
                />
                <Mail 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" 
                  aria-hidden="true"
                />
              </div>
              {errors.email && (
                <p id="email-error" className="text-sm text-red-600" role="alert">
                  {errors.email}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="sr-only">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors(prev => ({ ...prev, password: undefined }));
                    }
                  }}
                  className={`pl-10 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  required
                />
                <Lock 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" 
                  aria-hidden="true"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-sm text-red-600" role="alert">
                  {errors.password}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                aria-describedby="remember-description"
              />
              <Label 
                htmlFor="remember" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me for 30 days
              </Label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            aria-describedby={isLoading ? "loading-status" : undefined}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
          {isLoading && (
            <span id="loading-status" className="sr-only">
              Signing you in, please wait...
            </span>
          )}
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 gap-3">
            <Button
              variant="outline"
              type="button"
              className="w-full focus:ring-2 focus:ring-primary focus:ring-offset-2"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              aria-label="Sign in with Google"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.79-1.677-4.184-2.702-6.735-2.702-5.522 0-10 4.478-10 10s4.478 10 10 10c8.396 0 10-7.139 10-12c0-0.478-0.039-1.261-0.111-1.669h-9.889z"
                  fill="currentColor"
                />
              </svg>
              Continue with Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;