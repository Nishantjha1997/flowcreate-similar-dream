
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
        variant: "default"
      });
      return;
    }

    setIsProcessing(true);

    try {
      console.log('Initiating payment with options:', options);

      // Create order via Supabase edge function (amount is determined server-side)
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          planType: options.planType || 'monthly'
        }
      });

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error(orderError.message);
      }

      console.log('Order created successfully:', orderData);

      const { order_id, amount, currency, key_id } = orderData;

      // Configure Razorpay options
      const razorpayOptions = {
        key: key_id,
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
            console.log('Payment completed, verifying:', response);
            
            // Verify payment via Supabase edge function
            const { data: verificationData, error: verificationError } = await supabase.functions.invoke('verify-razorpay-payment', {
              body: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                planType: options.planType || 'monthly'
              }
            });

            if (verificationError) {
              console.error('Payment verification error:', verificationError);
              throw new Error(verificationError.message || 'Payment verification failed');
            }

            console.log('Payment verification successful:', verificationData);

            toast({
              title: "Payment Successful!",
              description: "Your premium subscription has been activated.",
              variant: "default"
            });

            // Refresh the page to update user status
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast({
              title: "Payment verification failed",
              description: "Please contact support if your payment was deducted. Error: " + (error instanceof Error ? error.message : 'Unknown error'),
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
        description: "Unable to initiate payment. Please try again. Error: " + (error instanceof Error ? error.message : 'Unknown error'),
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
