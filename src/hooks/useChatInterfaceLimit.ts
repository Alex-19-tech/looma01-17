import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ChatInterfaceLimit {
  canCreate: boolean;
  count: number;
  maxCount: number;
  hasUnlimited: boolean;
  loading: boolean;
  checkLimit: () => Promise<void>;
  incrementCount: () => Promise<void>;
}

export const useChatInterfaceLimit = (): ChatInterfaceLimit => {
  const { user } = useAuth();
  const [canCreate, setCanCreate] = useState(true);
  const [count, setCount] = useState(0);
  const [hasUnlimited, setHasUnlimited] = useState(false);
  const [loading, setLoading] = useState(true);
  const maxCount = 5;

  const checkLimit = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('can_create_chat_interface', {
        _user_id: user.id
      });

      if (error) throw error;

      // Also fetch the current count and unlimited status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('chat_interface_count, has_unlimited_interfaces')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      setCanCreate(data);
      setCount(profile.chat_interface_count);
      setHasUnlimited(profile.has_unlimited_interfaces);
    } catch (error) {
      console.error('Error checking chat interface limit:', error);
      setCanCreate(false);
    } finally {
      setLoading(false);
    }
  };

  const incrementCount = async () => {
    if (!user || hasUnlimited) return;

    try {
      await supabase.rpc('increment_chat_interface_count', {
        _user_id: user.id
      });
      
      await checkLimit(); // Refresh the limit status
    } catch (error) {
      console.error('Error incrementing chat interface count:', error);
    }
  };

  useEffect(() => {
    checkLimit();
  }, [user]);

  return {
    canCreate,
    count,
    maxCount,
    hasUnlimited,
    loading,
    checkLimit,
    incrementCount,
  };
};