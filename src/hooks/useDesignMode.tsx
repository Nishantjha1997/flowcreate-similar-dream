import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type DesignMode = 'default' | 'neo-brutalism';

interface DesignModeContextType {
  designMode: DesignMode;
  setDesignMode: (mode: DesignMode) => void;
  isNeoBrutalism: boolean;
}

const DesignModeContext = createContext<DesignModeContextType | undefined>(undefined);

interface DesignModeProviderProps {
  children: ReactNode;
}

export function DesignModeProvider({ children }: DesignModeProviderProps) {
  const [designMode, setDesignModeState] = useState<DesignMode>(() => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('designMode') as DesignMode;
      if (saved === 'neo-brutalism' || saved === 'default') {
        return saved;
      }
    }
    return 'default';
  });

  const setDesignMode = (mode: DesignMode) => {
    setDesignModeState(mode);
    localStorage.setItem('designMode', mode);
  };

  // Apply design mode class to document root
  useEffect(() => {
    const root = document.documentElement;
    
    if (designMode === 'neo-brutalism') {
      root.classList.add('neo-brutalism');
    } else {
      root.classList.remove('neo-brutalism');
    }
  }, [designMode]);

  const value: DesignModeContextType = {
    designMode,
    setDesignMode,
    isNeoBrutalism: designMode === 'neo-brutalism'
  };

  return (
    <DesignModeContext.Provider value={value}>
      {children}
    </DesignModeContext.Provider>
  );
}

export function useDesignMode() {
  const context = useContext(DesignModeContext);
  if (context === undefined) {
    throw new Error('useDesignMode must be used within a DesignModeProvider');
  }
  return context;
}

// Utility function for conditional classes
export function nb(neoBrutalismClasses: string, defaultClasses: string = ''): string {
  return `${defaultClasses} nb:${neoBrutalismClasses.split(' ').join(' nb:')}`;
}