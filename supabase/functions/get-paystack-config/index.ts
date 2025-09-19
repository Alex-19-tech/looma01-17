import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the Paystack public key from environment
    const paystackPublicKey = Deno.env.get('PAYSTACK_PUBLIC_KEY');

    if (!paystackPublicKey) {
      console.error('PAYSTACK_PUBLIC_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'Paystack configuration not available',
          publicKey: null 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate that it's a public key (starts with pk_)
    if (!paystackPublicKey.startsWith('pk_')) {
      console.error('Invalid Paystack public key format:', paystackPublicKey.substring(0, 10) + '...');
      return new Response(
        JSON.stringify({ 
          error: 'Invalid Paystack public key format',
          publicKey: null 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Paystack public key retrieved successfully:', paystackPublicKey.substring(0, 10) + '...');

    return new Response(
      JSON.stringify({ 
        publicKey: paystackPublicKey,
        error: null 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error retrieving Paystack config:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to retrieve Paystack configuration',
        publicKey: null 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});