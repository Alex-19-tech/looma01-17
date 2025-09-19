-- Add fields to profiles table to track chat interface limits and referral system
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS chat_interface_count integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_unlimited_interfaces boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by text,
ADD COLUMN IF NOT EXISTS active_referrals_count integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS referral_rewards_weeks integer NOT NULL DEFAULT 0;

-- Generate unique referral codes for existing users
UPDATE public.profiles 
SET referral_code = 'REF' || substr(gen_random_uuid()::text, 1, 8)
WHERE referral_code IS NULL;

-- Create trigger to generate referral codes for new users
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := 'REF' || substr(gen_random_uuid()::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_referral_code();

-- Function to check if user can create new chat interface
CREATE OR REPLACE FUNCTION public.can_create_chat_interface(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN has_unlimited_interfaces = true THEN true
      WHEN chat_interface_count < 5 THEN true
      ELSE false
    END
  FROM public.profiles 
  WHERE id = _user_id;
$$;

-- Function to increment chat interface count
CREATE OR REPLACE FUNCTION public.increment_chat_interface_count(_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.profiles 
  SET chat_interface_count = chat_interface_count + 1
  WHERE id = _user_id;
$$;

-- Function to process referral when user becomes active
CREATE OR REPLACE FUNCTION public.process_referral_activation(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referrer_id uuid;
BEGIN
  -- Get the referrer's user ID from their referral code
  SELECT p.id INTO referrer_id
  FROM public.profiles p1
  JOIN public.profiles p ON p.referral_code = p1.referred_by
  WHERE p1.id = _user_id;
  
  IF referrer_id IS NOT NULL THEN
    -- Increment referrer's active referrals and reward weeks
    UPDATE public.profiles
    SET 
      active_referrals_count = active_referrals_count + 1,
      referral_rewards_weeks = referral_rewards_weeks + 1,
      has_unlimited_interfaces = CASE 
        WHEN active_referrals_count + 1 >= 4 THEN true 
        ELSE has_unlimited_interfaces 
      END
    WHERE id = referrer_id;
  END IF;
END;
$$;