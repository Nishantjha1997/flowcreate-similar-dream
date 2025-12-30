import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const { resetPassword } = useAuth();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await resetPassword(email);
      
      if (error) throw error;
      
      setIsSubmitted(true);
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your email for further instructions",
      });
    } catch (error: any) {
      toast({
        title: "Password Reset Failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-card rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-foreground">
            Forgot your password?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>
        
        {isSubmitted ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 mt-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                  Email sent
                </h3>
                <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                  <p>
                    We've sent password reset instructions to your email. Please check your inbox.
                  </p>
                </div>
                <div className="mt-4">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Return to login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send reset link"}
            </Button>
            
            <div className="text-center mt-4">
              <Link
                to="/login"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Back to login
              </Link>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
