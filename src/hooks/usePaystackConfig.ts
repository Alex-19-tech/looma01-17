import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PaystackConfig {
  publicKey: string | null;
  loading: boolean;
  error: string | null;
}

export const usePaystackConfig = (): PaystackConfig => {
  const [config, setConfig] = useState<PaystackConfig>({
    publicKey: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchPaystackConfig = async () => {
      try {
        // Fetch Paystack public key from edge function
        const { data, error } = await supabase.functions.invoke('get-paystack-config');
        
        if (error) {
          throw new Error(error.message || 'Failed to fetch Paystack config');
        }

        if (data?.error) {
          throw new Error(data.error);
        }

        const publicKey = data?.publicKey;
        
        if (!publicKey) {
          throw new Error('No Paystack public key received');
        }

        // Log for debugging (safe since it's a public key)
        console.log('Paystack public key loaded:', publicKey.substring(0, 10) + '...');
        
        setConfig({
          publicKey,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        console.error('Error fetching Paystack config:', error);
        setConfig({
          publicKey: null,
          loading: false,
          error: error.message,
        });
      }
    };

    fetchPaystackConfig();
  }, []);

  return config;
};