
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useRazorpay } from '@/components/RazorpayProvider';

interface PaymentOptions {
  amount: number; // in paise
  currency?: string;
  description?: string;
  planType?: string;
}

export const useRazorpayPayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { isLoaded } = useRazorpay();

  const initiatePayment = async (options: PaymentOptions) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to purchase a subscription.",
        variant: "destructive"
      });
      return;
    }

    if (!isLoaded) {
      toast({
        title: "Payment system loading",
        description: "Please wait for the payment system to load.",
        variant: "warning"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create order via Supabase edge function
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: options.amount,
          currency: options.currency || 'INR',
          receipt: `order_${Date.now()}`,
          planType: options.planType || 'monthly'
        }
      });

      if (orderError) {
        throw new Error(orderError.message);
      }

      const { order_id, amount, currency } = orderData;

      // Configure Razorpay options
      const razorpayOptions = {
        key: 'rzp_live_4iFgy48cvcW4fF', // Live key
        amount: amount,
        currency: currency,
        name: 'FlowCreate',
        description: options.description || 'Premium Subscription',
        order_id: order_id,
        prefill: {
          email: user.email,
          name: user.user_metadata?.full_name || user.email
        },
        theme: {
          color: '#3B82F6'
        },
        handler: async (response: any) => {
          try {
            // Verify payment via Supabase edge function
            const { data: verificationData, error: verificationError } = await supabase.functions.invoke('verify-razorpay-payment', {
              body: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                user_id: user.id,
                planType: options.planType || 'monthly'
              }
            });

            if (verificationError) {
              throw new Error(verificationError.message);
            }

            toast({
              title: "Payment Successful!",
              description: "Your premium subscription has been activated.",
              variant: "default"
            });

            // Refresh the page to update user status
            window.location.reload();
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast({
              title: "Payment verification failed",
              description: "Please contact support if your payment was deducted.",
              variant: "destructive"
            });
          }
        },
        modal: {
          ondismiss: () => {
            toast({
              title: "Payment cancelled",
              description: "You can try again anytime.",
              variant: "default"
            });
          }
        }
      };

      // Open Razorpay checkout
      const rzp = new window.Razorpay(razorpayOptions);
      rzp.open();

    } catch (error) {
      console.error('Payment initiation failed:', error);
      toast({
        title: "Payment failed",
        description: "Unable to initiate payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    initiatePayment,
    isProcessing
  };
};
