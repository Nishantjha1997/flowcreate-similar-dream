
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
    const source = 'https://checkout.razorpay.com/v1/checkout.js';
    if (window.Razorpay) {
      setIsLoaded(true);
      return;
    }

    // Reuse an in-flight or previously inserted script. Removing it during a
    // provider remount can strand checkout buttons in a permanent loading
    // state and duplicate script tags can race their onload handlers.
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${source}"]`);
    const script = existingScript ?? document.createElement('script');
    if (!existingScript) {
      script.src = source;
      script.async = true;
      document.body.appendChild(script);
    }

    const handleLoad = () => setIsLoaded(Boolean(window.Razorpay));
    script.addEventListener('load', handleLoad, { once: true });
    if (window.Razorpay) handleLoad();

    return () => script.removeEventListener('load', handleLoad);
  }, []);

  return (
    <RazorpayContext.Provider value={{ isLoaded }}>
      {children}
    </RazorpayContext.Provider>
  );
};
