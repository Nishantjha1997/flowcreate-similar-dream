
import React, { createContext, useContext, useEffect } from 'react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayContextType {
  isLoaded: boolean;
}

const RazorpayContext = createContext<RazorpayContextType>({ isLoaded: false });

export const useRazorpay = () => useContext(RazorpayContext);

interface RazorpayProviderProps {
  children: React.ReactNode;
}

export const RazorpayProvider: React.FC<RazorpayProviderProps> = ({ children }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsLoaded(true);
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <RazorpayContext.Provider value={{ isLoaded }}>
      {children}
    </RazorpayContext.Provider>
  );
};
