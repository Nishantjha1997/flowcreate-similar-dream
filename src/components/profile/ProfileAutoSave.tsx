import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Cloud, CloudOff, Loader2, AlertCircle } from 'lucide-react';
import { useDebouncedCallback } from '@/hooks/usePerformanceOptimization';

interface ProfileAutoSaveProps {
  hasUnsavedChanges: boolean;
  isUpdating: boolean;
  lastSaved?: Date;
  onSave: () => void;
}

export const ProfileAutoSave: React.FC<ProfileAutoSaveProps> = ({
  hasUnsavedChanges,
  isUpdating,
  lastSaved,
  onSave
}) => {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'pending' | 'error'>('saved');
  const [showStatus, setShowStatus] = useState(false);

  // Debounce the auto-save trigger
  const debouncedSave = useDebouncedCallback(() => {
    if (hasUnsavedChanges && !isUpdating) {
      onSave();
    }
  }, 2000);

  useEffect(() => {
    if (hasUnsavedChanges) {
      setSaveStatus('pending');
      setShowStatus(true);
      debouncedSave();
    }
  }, [hasUnsavedChanges, debouncedSave]);

  useEffect(() => {
    if (isUpdating) {
      setSaveStatus('saving');
      setShowStatus(true);
    } else if (!hasUnsavedChanges && saveStatus === 'saving') {
      setSaveStatus('saved');
      // Hide status after 2 seconds
      setTimeout(() => setShowStatus(false), 2000);
    }
  }, [isUpdating, hasUnsavedChanges, saveStatus]);

  const getStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <Loader2 className="w-3 h-3 animate-spin" />;
      case 'saved':
        return <CheckCircle2 className="w-3 h-3" />;
      case 'pending':
        return <Cloud className="w-3 h-3" />;
      case 'error':
        return <CloudOff className="w-3 h-3" />;
      default:
        return <Cloud className="w-3 h-3" />;
    }
  };

  const getStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return lastSaved ? `Saved ${formatLastSaved(lastSaved)}` : 'Saved';
      case 'pending':
        return 'Pending...';
      case 'error':
        return 'Save failed';
      default:
        return 'Auto-save enabled';
    }
  };

  const getStatusVariant = () => {
    switch (saveStatus) {
      case 'saving':
        return 'secondary';
      case 'saved':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatLastSaved = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  if (!showStatus && saveStatus === 'saved') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge 
        variant={getStatusVariant() as any}
        className="flex items-center gap-2 px-3 py-2 text-xs shadow-lg animate-in slide-in-from-right-2"
      >
        {getStatusIcon()}
        {getStatusText()}
      </Badge>
    </div>
  );
};