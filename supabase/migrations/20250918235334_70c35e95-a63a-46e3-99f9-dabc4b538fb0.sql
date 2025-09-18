-- Add currency fields to user_transactions table
ALTER TABLE public.user_transactions 
ADD COLUMN fx_rate_snapshot numeric(10,5),
ADD COLUMN charged_amount_kes integer,
ADD COLUMN usd_price numeric(10,2);

-- Add comment for clarity
COMMENT ON COLUMN public.user_transactions.fx_rate_snapshot IS 'USD to KES exchange rate at time of transaction';
COMMENT ON COLUMN public.user_transactions.charged_amount_kes IS 'Amount charged in KES kobo (cents)';
COMMENT ON COLUMN public.user_transactions.usd_price IS 'Display price in USD';