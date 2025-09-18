import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  email: string;
  amount: number; // USD amount for display
  plan: string;
  callback_url: string;
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

    const { email, amount, plan, callback_url }: PaymentRequest = await req.json();

    // Get FX rate from environment (default to 129.202 if not set)
    const fxRate = parseFloat(Deno.env.get('FX_RATE_USD_TO_KES') || '129.202');
    const kesAmount = Math.round(amount * fxRate * 100); // Convert to KES kobo

    console.log('Initializing payment for:', { email, usd_amount: amount, kes_amount: kesAmount, plan, fx_rate: fxRate });

    // Initialize transaction with Paystack
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: kesAmount, // Amount in KES kobo
        currency: 'KES',
        callback_url,
        metadata: {
          user_id: user.id,
          plan,
          usd_price: amount,
          fx_rate: fxRate,
          custom_fields: [
            {
              display_name: "Plan",
              variable_name: "plan",
              value: plan
            },
            {
              display_name: "USD Price",
              variable_name: "usd_price",
              value: `$${amount}`
            }
          ]
        }
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      console.error('Paystack initialization failed:', paystackData);
      return new Response(
        JSON.stringify({ error: 'Payment initialization failed', details: paystackData.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Payment initialized successfully:', paystackData.data.reference);

    // Store transaction reference in database for verification
    const { error: dbError } = await supabase
      .from('user_transactions')
      .insert({
        user_id: user.id,
        reference: paystackData.data.reference,
        amount: kesAmount / 100, // Store KES amount in whole units
        usd_price: amount,
        fx_rate_snapshot: fxRate,
        charged_amount_kes: kesAmount,
        plan,
        status: 'pending',
        email
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue anyway, we can still verify later
    }

    return new Response(
      JSON.stringify({
        status: true,
        data: {
          authorization_url: paystackData.data.authorization_url,
          access_code: paystackData.data.access_code,
          reference: paystackData.data.reference
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in paystack-initialize function:', error);
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