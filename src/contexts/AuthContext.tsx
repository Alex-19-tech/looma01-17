import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  signInWithOAuth: (provider: 'google' | 'facebook' | 'apple') => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Track user session
        if (session?.user && event === 'SIGNED_IN') {
          setTimeout(() => {
            trackUserSession(session.user.id);
            updateLastLogin(session.user.id);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string, rememberMe = false) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    if (user) {
      // Track logout
      setTimeout(() => {
        trackUserLogout(user.id);
      }, 0);
    }
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { error };
  };

  const signInWithOAuth = async (provider: 'google' | 'facebook' | 'apple') => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
      },
    });
    return { error };
  };

  const trackUserSession = async (userId: string) => {
    try {
      await supabase.from('sessions').insert({
        user_id: userId,
        ip_address: null,
        user_agent: navigator.userAgent,
      });
    } catch (error) {
      console.error('Error tracking user session:', error);
    }
  };

  const updateLastLogin = async (userId: string) => {
    try {
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  };

  const trackUserLogout = async (userId: string) => {
    try {
      // Update the most recent session with logout time
      const { data: sessions } = await supabase
        .from('sessions')
        .select('id')
        .eq('user_id', userId)
        .is('logout_at', null)
        .order('login_at', { ascending: false })
        .limit(1);

      if (sessions && sessions.length > 0) {
        await supabase
          .from('sessions')
          .update({ logout_at: new Date().toISOString() })
          .eq('id', sessions[0].id);
      }
    } catch (error) {
      console.error('Error tracking user logout:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    signInWithOAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}