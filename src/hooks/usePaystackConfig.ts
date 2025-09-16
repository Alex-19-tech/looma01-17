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
        // For now, we'll use the stored secret as public key
        // In a real implementation, you'd store public and secret keys separately
        const publicKey = 'pk_test_b74e730c9eb9fe4ed348e5d003b97dc30a139b9b'; // Default test key
        
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