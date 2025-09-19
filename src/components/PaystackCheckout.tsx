import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface PaystackCheckoutProps {
  plan: string;
  amount: number;
  description: string;
  className?: string;
  disabled?: boolean;
}

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export const PaystackCheckout = ({ 
  plan, 
  amount, 
  description, 
  className,
  disabled = false 
}: PaystackCheckoutProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const initializePayment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to make a payment.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Initialize payment
      const { data, error } = await supabase.functions.invoke('paystack-initialize', {
        body: {
          email: user.email,
          amount,
          plan,
          callback_url: `${window.location.origin}/payment-success`
        }
      });

      if (error) throw error;

      if (!data.status) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      // Load Paystack script if not already loaded
      if (!window.PaystackPop) {
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.onload = () => openPaystackPopup(data.data);
        document.head.appendChild(script);
      } else {
        openPaystackPopup(data.data);
      }

    } catch (error: any) {
      console.error('Payment initialization error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const openPaystackPopup = (paymentData: any) => {
    // Calculate KES amount using fixed rate (USD to KES: 129.202)
    const fxRate = 129.202;
    const kesAmount = Math.round(amount * fxRate * 100); // Convert to KES kobo
    
    // Define payment success handler function
    const handlePaymentSuccess = (response: any) => {
      console.log('Payment complete:', response.reference);
      // Verify payment asynchronously without blocking callback
      verifyPayment(response.reference).catch(console.error);
    };

    // Defensive check to ensure callback is a function
    console.assert(typeof handlePaymentSuccess === 'function', 
                   'handlePaymentSuccess must be a function');
    
    const handler = window.PaystackPop.setup({
      key: 'pk_test_b74e730c9eb9fe4ed348e5d003b97dc30a139b9b', // Paystack test public key
      email: user?.email,
      amount: kesAmount, // Amount in KES kobo
      currency: 'KES',
      ref: paymentData.reference,
      callback: handlePaymentSuccess,
      onClose: () => {
        console.log('Payment popup closed');
        setIsProcessing(false);
      },
    });

    handler.openIframe();
  };

  const verifyPayment = async (reference: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('paystack-verify', {
        body: { reference }
      });

      if (error) throw error;

      if (data.status) {
        toast({
          title: "Payment Successful!",
          description: `Your ${plan} subscription has been activated.`,
        });
        
        // Refresh the page to update user subscription status
        window.location.reload();
      } else {
        toast({
          title: "Payment Verification Failed",
          description: data.message || "Please contact support if you were charged.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      toast({
        title: "Verification Error",
        description: "Payment verification failed. Please contact support.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={initializePayment}
      disabled={disabled || isProcessing}
      className={className}
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        description
      )}
    </Button>
  );
};