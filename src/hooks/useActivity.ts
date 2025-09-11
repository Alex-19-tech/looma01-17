import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  description: string;
  metadata?: any;
  created_at: string;
}

export function useActivity() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchActivities();
    } else {
      setActivities([]);
      setLoading(false);
    }
  }, [user]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_inputs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Transform user_inputs into activity format
      const activityData: ActivityLog[] = (data || []).map(input => ({
        id: input.id,
        user_id: input.user_id,
        action: getActionFromType(input.prompt_type),
        description: getDescriptionFromType(input.prompt_type),
        metadata: { prompt_type: input.prompt_type, input: input.raw_input },
        created_at: input.created_at,
      }));

      setActivities(activityData);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getActionFromType = (promptType: string) => {
    switch (promptType) {
      case 'research':
        return 'Research session started';
      case 'writing':
        return 'Writing session started';
      case 'analysis':
        return 'Analysis session started';
      case 'brainstorming':
        return 'Brainstorming session started';
      default:
        return 'New chat session started';
    }
  };

  const getDescriptionFromType = (promptType: string) => {
    switch (promptType) {
      case 'research':
        return 'Research Assistant Template';
      case 'writing':
        return 'Writing Assistant Template';
      case 'analysis':
        return 'Analysis Template';
      case 'brainstorming':
        return 'Brainstorming Template';
      default:
        return 'AI Workflow Chat';
    }
  };

  const getColorFromType = (promptType: string) => {
    switch (promptType) {
      case 'research':
        return 'bg-blue-500';
      case 'writing':
        return 'bg-green-500';
      case 'analysis':
        return 'bg-purple-500';
      case 'brainstorming':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return {
    activities,
    loading,
    refetch: fetchActivities,
    getColorFromType,
  };
}