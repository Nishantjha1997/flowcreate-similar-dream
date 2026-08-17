import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useRazorpay } from '@/components/RazorpayProvider';
import { captureError } from '@/lib/monitoring';
import { getEdgeFunctionErrorMessage } from '@/utils/edgeFunctionError';

interface PaymentOptions {
  amount: number;
  currency?: 'INR' | 'USD';
  description?: string;
  planType?: 'monthly' | 'yearly' | 'lifetime';
}

type CheckoutData = {
  key_id: string;
  amount: number;
  currency: string;
  order_id?: string;
  subscription_id?: string;
};

export const useRazorpayPayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { isLoaded } = useRazorpay();

  const initiatePayment = async (options: PaymentOptions) => {
    if (!user) {
      toast({ title: 'Authentication required', description: 'Please log in to purchase a subscription.', variant: 'destructive' });
      return;
    }
    if (!isLoaded) {
      toast({ title: 'Payment system loading', description: 'Please wait for the payment system to load.' });
      return;
    }
    setIsProcessing(true);
    const planType = options.planType ?? 'monthly';
    const isRecurring = planType === 'monthly' || planType === 'yearly';
    try {
      const { data, error } = await supabase.functions.invoke(
        isRecurring ? 'create-razorpay-subscription' : 'create-razorpay-order',
        { body: { planType, currency: options.currency ?? 'INR' } },
      );
      if (error) throw new Error(await getEdgeFunctionErrorMessage(error, 'Failed to create payment checkout'));
      const checkout: CheckoutData = data;
      if (!checkout.key_id || (!checkout.order_id && !checkout.subscription_id)) throw new Error('Payment checkout response was incomplete');

      const razorpayOptions = {
        key: checkout.key_id,
        amount: checkout.amount,
        currency: checkout.currency,
        name: 'MakeCV',
        description: options.description || `MakeCV ${planType} plan`,
        ...(isRecurring ? { subscription_id: checkout.subscription_id } : { order_id: checkout.order_id }),
        prefill: { email: user.email, name: user.user_metadata?.full_name || user.email },
        theme: { color: '#3B82F6' },
        handler: async (response: Record<string, string>) => {
          try {
            const verifyFunction = isRecurring ? 'verify-razorpay-subscription' : 'verify-razorpay-payment';
            const verifyBody = isRecurring
              ? {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_subscription_id: response.razorpay_subscription_id || checkout.subscription_id,
                  razorpay_signature: response.razorpay_signature,
                }
              : {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id || checkout.order_id,
                  razorpay_signature: response.razorpay_signature,
                  planType,
                };
            const { error: verificationError } = await supabase.functions.invoke(verifyFunction, { body: verifyBody });
            if (verificationError) throw new Error(await getEdgeFunctionErrorMessage(verificationError, 'Payment verification failed'));
            toast({ title: 'Payment Successful!', description: isRecurring ? 'Your subscription is active.' : 'Your premium access has been activated.' });
            window.setTimeout(() => window.location.reload(), 1000);
          } catch (error) {
            captureError(error, { context: 'payment_verification' });
            toast({ title: 'Payment verification failed', description: `Please contact support if your payment was deducted. ${error instanceof Error ? error.message : ''}`, variant: 'destructive' });
          }
        },
        modal: { ondismiss: () => toast({ title: 'Payment cancelled', description: 'You can try again anytime.' }) },
      };
      const rzp = new window.Razorpay(razorpayOptions);
      rzp.open();
    } catch (error) {
      captureError(error, { context: 'payment_initiation' });
      toast({ title: 'Payment failed', description: `Unable to initiate payment. ${error instanceof Error ? error.message : ''}`, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  return { initiatePayment, isProcessing };
};
