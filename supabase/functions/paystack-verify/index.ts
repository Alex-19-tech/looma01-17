import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyRequest {
  reference: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { reference }: VerifyRequest = await req.json();

    console.log('Verifying payment for reference:', reference);

    // Verify transaction with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      console.error('Paystack verification failed:', paystackData);
      return new Response(
        JSON.stringify({ error: 'Payment verification failed', details: paystackData.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const transaction = paystackData.data;
    console.log('Transaction data:', transaction);

    // Check if payment was successful
    if (transaction.status !== 'success') {
      console.log('Payment not successful:', transaction.status);
      return new Response(
        JSON.stringify({ 
          status: false, 
          message: 'Payment was not successful',
          transaction_status: transaction.status 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update user profile with new subscription
    const plan = transaction.metadata?.plan || 'pro';
    const amount = transaction.amount / 100; // Convert from kobo

    // Calculate subscription expiry (30 days from now)
    const subscriptionExpiry = new Date();
    subscriptionExpiry.setDate(subscriptionExpiry.getDate() + 30);

    // Update user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        plan: plan as any,
        payment_status: 'active',
        subscription_expires_at: subscriptionExpiry.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to update user profile', details: profileError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update transaction record
    const { error: transactionError } = await supabase
      .from('user_transactions')
      .update({
        status: 'success',
        verified_at: new Date().toISOString(),
        paystack_data: transaction
      })
      .eq('reference', reference)
      .eq('user_id', user.id);

    if (transactionError) {
      console.error('Transaction update error:', transactionError);
      // Continue anyway, the profile is already updated
    }

    console.log('Payment verification successful for user:', user.id);

    return new Response(
      JSON.stringify({
        status: true,
        message: 'Payment verified successfully',
        data: {
          reference: transaction.reference,
          amount,
          plan,
          subscription_expires_at: subscriptionExpiry.toISOString()
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in paystack-verify function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);