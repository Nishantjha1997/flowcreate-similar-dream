import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type DesignMode = 'default' | 'neo-brutalism';

interface DesignModeSettingValue {
  mode: DesignMode;
}

interface DesignModeContextType {
  designMode: DesignMode;
  setDesignMode: (mode: DesignMode) => void;
  isNeoBrutalism: boolean;
  isLoading: boolean;
}

const DesignModeContext = createContext<DesignModeContextType | undefined>(undefined);

interface DesignModeProviderProps {
  children: ReactNode;
}

export function DesignModeProvider({ children }: DesignModeProviderProps) {
  const [designMode, setDesignModeState] = useState<DesignMode>('default');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch design mode from database on mount
  useEffect(() => {
    const fetchDesignMode = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('setting_key', 'design_mode')
          .single();

        if (error) {
          console.error('Error fetching design mode:', error);
          return;
        }

        const settingValue = data?.setting_value as unknown as DesignModeSettingValue | null;
        if (settingValue?.mode) {
          setDesignModeState(settingValue.mode);
        }
      } catch (error) {
        console.error('Error fetching design mode:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDesignMode();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('site_settings_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'site_settings',
          filter: 'setting_key=eq.design_mode'
        },
        (payload) => {
          if (payload.new?.setting_value?.mode) {
            setDesignModeState(payload.new.setting_value.mode as DesignMode);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const setDesignMode = async (mode: DesignMode) => {
    // Optimistically update UI
    setDesignModeState(mode);

    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ setting_value: { mode } })
        .eq('setting_key', 'design_mode');

      if (error) {
        console.error('Error updating design mode:', error);
        // Revert on error - refetch from DB
        const { data } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('setting_key', 'design_mode')
          .single();
        
        const revertValue = data?.setting_value as unknown as DesignModeSettingValue | null;
        if (revertValue?.mode) {
          setDesignModeState(revertValue.mode);
        }
      }
    } catch (error) {
      console.error('Error updating design mode:', error);
    }
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
    isNeoBrutalism: designMode === 'neo-brutalism',
    isLoading
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
