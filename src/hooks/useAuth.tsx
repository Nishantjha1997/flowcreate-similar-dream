
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient, User, Session } from '@supabase/supabase-js';
import { toast } from "@/components/ui/use-toast";

// Initialize Supabase client with fallback values or environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a mock client if credentials are missing
const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : createMockClient();

// Mock client function to use when credentials are not available
function createMockClient() {
  console.warn("Supabase credentials not found. Using mock authentication client.");
  
  // Return a mock client with the same API but no actual Supabase connections
  return {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ 
        data: { 
          subscription: { unsubscribe: () => {} } 
        } 
      }),
      signInWithPassword: async () => ({ error: new Error("Authentication is not configured") }),
      signUp: async () => ({ error: new Error("Authentication is not configured") }),
      signOut: async () => ({}),
      resetPasswordForEmail: async () => ({ error: new Error("Authentication is not configured") }),
    }
  } as ReturnType<typeof createClient>;
}

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(Boolean(supabaseUrl && supabaseKey));

  useEffect(() => {
    // Show a warning toast if Supabase is not configured
    if (!isConfigured) {
      toast({
        title: "Authentication Not Configured",
        description: "Supabase credentials are missing. Please set up your environment variables.",
        variant: "destructive",
      });
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user || null);
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    let subscription: { unsubscribe: () => void } = { unsubscribe: () => {} };
    
    try {
      const { data } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setSession(session);
          setUser(session?.user || null);
          setIsLoading(false);
        }
      );
      
      subscription = data.subscription;
    } catch (error) {
      console.error("Error setting up auth state change listener:", error);
      setIsLoading(false);
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  const signIn = async (email: string, password: string) => {
    if (!isConfigured) {
      toast({
        title: "Authentication Not Configured",
        description: "Supabase credentials are missing. Please set up your environment variables.",
        variant: "destructive",
      });
      return { error: new Error("Authentication is not configured") };
    }
    
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, userData = {}) => {
    if (!isConfigured) {
      toast({
        title: "Authentication Not Configured",
        description: "Supabase credentials are missing. Please set up your environment variables.",
        variant: "destructive",
      });
      return { error: new Error("Authentication is not configured") };
    }
    
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: userData
        }
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    if (isConfigured) {
      await supabase.auth.signOut();
    }
  };

  const resetPassword = async (email: string) => {
    if (!isConfigured) {
      toast({
        title: "Authentication Not Configured",
        description: "Supabase credentials are missing. Please set up your environment variables.",
        variant: "destructive",
      });
      return { error: new Error("Authentication is not configured") };
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
