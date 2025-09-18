import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');
    
    const paymentRef = reference || trxref;

    if (!paymentRef) {
      setStatus('failed');
      setMessage('No payment reference found');
      return;
    }

    const verifyPayment = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('paystack-verify', {
          body: { reference: paymentRef }
        });

        if (error) throw error;

        if (data.status) {
          setStatus('success');
          setMessage(`Payment successful! Your ${data.data.plan} subscription has been activated.`);
          
          toast({
            title: "Payment Successful!",
            description: `Your ${data.data.plan} subscription has been activated.`,
          });
        } else {
          setStatus('failed');
          setMessage(data.message || 'Payment verification failed');
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        setStatus('failed');
        setMessage('Payment verification failed. Please contact support if you were charged.');
      }
    };

    verifyPayment();
  }, [searchParams, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'loading' && (
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-16 w-16 text-green-500" />
            )}
            {status === 'failed' && (
              <XCircle className="h-16 w-16 text-destructive" />
            )}
          </div>
          <CardTitle>
            {status === 'loading' && 'Verifying Payment...'}
            {status === 'success' && 'Payment Successful!'}
            {status === 'failed' && 'Payment Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{message}</p>
          
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link to="/chat">Go to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/pricing">Back to Pricing</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;