import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'english' | 'spanish' | 'french';
  email_notifications: boolean;
  auto_save_chats: boolean;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'english',
  email_notifications: true,
  auto_save_chats: true,
};

export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPreferences();
    } else {
      setPreferences(defaultPreferences);
      setLoading(false);
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (data?.preferences) {
        setPreferences({ ...defaultPreferences, ...(data.preferences as Partial<UserPreferences>) });
      }
    } catch (err) {
      console.error('Error fetching preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    try {
      const updatedPreferences = { ...preferences, ...newPreferences };
      
      const { error } = await supabase
        .from('profiles')
        .update({ preferences: updatedPreferences })
        .eq('id', user?.id);

      if (error) throw error;

      setPreferences(updatedPreferences);
      return { success: true };
    } catch (err: any) {
      console.error('Error updating preferences:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    preferences,
    loading,
    updatePreferences,
  };
}