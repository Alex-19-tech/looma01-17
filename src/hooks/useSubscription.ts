import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

export interface SubscriptionStatus {
  isActive: boolean;
  plan: string;
  expiresAt: string | null;
  paymentStatus: string | null;
  loading: boolean;
}

export const useSubscription = (): SubscriptionStatus => {
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    isActive: false,
    plan: 'free',
    expiresAt: null,
    paymentStatus: null,
    loading: true,
  });

  useEffect(() => {
    if (!user || loading) {
      setSubscriptionStatus(prev => ({ ...prev, loading: true }));
      return;
    }

    if (!profile) {
      setSubscriptionStatus({
        isActive: false,
        plan: 'free',
        expiresAt: null,
        paymentStatus: null,
        loading: false,
      });
      return;
    }

    const now = new Date();
    const expiresAt = profile.subscription_expires_at ? new Date(profile.subscription_expires_at) : null;
    const isActive = profile.plan !== 'free' && 
                     profile.payment_status === 'active' && 
                     (!expiresAt || expiresAt > now);

    setSubscriptionStatus({
      isActive,
      plan: profile.plan,
      expiresAt: profile.subscription_expires_at,
      paymentStatus: profile.payment_status,
      loading: false,
    });
  }, [user, profile, loading]);

  return subscriptionStatus;
};