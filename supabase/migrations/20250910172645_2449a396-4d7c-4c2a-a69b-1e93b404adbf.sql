-- Add redirect_url column to payments table
ALTER TABLE public.payments 
ADD COLUMN redirect_url TEXT;