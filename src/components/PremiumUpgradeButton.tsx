
import React from 'react';
import { Button } from '@/components/ui/button';
import { Crown, Loader2 } from 'lucide-react';
import { useRazorpayPayment } from '@/hooks/useRazorpayPayment';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { useAuth } from '@/hooks/useAuth';

interface PremiumUpgradeButtonProps {
  planType?: 'monthly' | 'yearly';
  amount: number; // in rupees
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'secondary';
  children?: React.ReactNode;
}

export const PremiumUpgradeButton: React.FC<PremiumUpgradeButtonProps> = ({
  planType = 'monthly',
  amount,
  className,
  size = 'default',
  variant = 'default',
  children
}) => {
  const { user } = useAuth();
  const { data: premiumStatus } = usePremiumStatus(user?.id);
  const { initiatePayment, isProcessing } = useRazorpayPayment();

  const handleUpgrade = () => {
    initiatePayment({
      amount: amount * 100, // Convert to paise
      description: `FlowCreate ${planType} subscription`,
      planType
    });
  };

  if (premiumStatus?.isPremium) {
    return (
      <Button 
        variant="outline" 
        size={size}
        className={className}
        disabled
      >
        <Crown className="mr-2 h-4 w-4 text-yellow-500" />
        Premium Active
      </Button>
    );
  }

  return (
    <Button
      onClick={handleUpgrade}
      disabled={isProcessing}
      variant={variant}
      size={size}
      className={className}
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Crown className="mr-2 h-4 w-4" />
          {children || `Upgrade - ₹${amount}`}
        </>
      )}
    </Button>
  );
};
