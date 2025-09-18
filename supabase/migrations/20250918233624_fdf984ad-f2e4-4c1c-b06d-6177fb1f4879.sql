-- Create user_transactions table for tracking payment transactions
CREATE TABLE public.user_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reference TEXT NOT NULL UNIQUE,
  amount NUMERIC NOT NULL,
  plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  email TEXT NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  paystack_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own transactions" 
ON public.user_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
ON public.user_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
ON public.user_transactions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions" 
ON public.user_transactions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_transactions_updated_at
BEFORE UPDATE ON public.user_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();