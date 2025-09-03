import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FieldErrorProps {
  error?: string;
  className?: string;
}

export function FieldError({ error, className }: FieldErrorProps) {
  if (!error) return null;

  return (
    <div className={cn("flex items-center gap-1 text-sm text-red-600 dark:text-red-400 mt-1", className)}>
      <AlertCircle className="h-3 w-3 flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
}

export function useFieldValidation() {
  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return undefined;
  };

  const validateRequired = (value: string, fieldName: string): string | undefined => {
    if (!value?.trim()) return `${fieldName} is required`;
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (!phone) return 'Phone number is required';
    if (!/^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      return 'Please enter a valid phone number';
    }
    return undefined;
  };

  const validateUrl = (url: string): string | undefined => {
    if (!url) return undefined; // URL is optional
    try {
      new URL(url);
      return undefined;
    } catch {
      return 'Please enter a valid URL (e.g., https://example.com)';
    }
  };

  return {
    validateEmail,
    validatePassword,
    validateRequired,
    validatePhone,
    validateUrl
  };
}