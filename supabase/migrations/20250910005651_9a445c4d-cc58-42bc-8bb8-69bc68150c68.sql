-- Create payments table to store J.P. Morgan payment data
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  payment_intent_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  amount DECIMAL(10,2) NOT NULL,
  merchant_reference TEXT NOT NULL,
  plan_type TEXT NOT NULL DEFAULT 'pro',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own payments" 
ON public.payments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments" 
ON public.payments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update payment status" 
ON public.payments 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can view all payments" 
ON public.payments 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add payment status to profiles table
ALTER TABLE public.profiles 
ADD COLUMN payment_status TEXT DEFAULT 'none',
ADD COLUMN subscription_expires_at TIMESTAMP WITH TIME ZONE;