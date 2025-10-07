import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./hooks/useAuth";
import { RazorpayProvider } from "./components/RazorpayProvider";
import { LoadingFallback } from "./components/ui/loading-fallback";
import { ErrorBoundary } from "./components/ui/error-boundary";

// Lazy load pages for better initial bundle size
const Index = lazy(() => import("./pages/Index"));
const Templates = lazy(() => import("./pages/Templates"));
const ResumeBuilder = lazy(() => import("./pages/ResumeBuilder"));
const Examples = lazy(() => import("./pages/Examples"));
const Features = lazy(() => import("./pages/Features"));
const Pricing = lazy(() => import("./pages/Pricing"));
const About = lazy(() => import("./pages/About"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Account = lazy(() => import("./pages/Account"));
const AccountSettings = lazy(() => import("./pages/AccountSettings"));
const Admin = lazy(() => import("./pages/Admin"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy"));

// ATS Pages
const ATSLanding = lazy(() => import("./pages/ats/ATSLanding"));
const ATSLogin = lazy(() => import("./pages/ats/ATSLogin"));
const ATSDashboard = lazy(() => import("./pages/ats/ATSDashboard"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false, // Reduce unnecessary requests
    }
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <ErrorBoundary>
        <AuthProvider>
          <RazorpayProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/templates" element={<Templates />} />
                  <Route path="/resume-builder" element={<ResumeBuilder />} />
                  <Route path="/examples" element={<Examples />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/account/settings" element={<AccountSettings />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/refund-policy" element={<RefundPolicy />} />
                  <Route path="/shipping-policy" element={<ShippingPolicy />} />
                  
                  {/* ATS Routes */}
                  <Route path="/ats" element={<ATSLanding />} />
                  <Route path="/ats/login" element={<ATSLogin />} />
                  <Route path="/ats/dashboard" element={<ATSDashboard />} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </RazorpayProvider>
      </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;