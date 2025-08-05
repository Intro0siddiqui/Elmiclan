
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { User, Rank } from '@/lib/types';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, rank: Rank) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*, rank:ranks(name)')
          .eq('id', session.user.id)
          .single();
        setUser(profile as User);
      }
      setLoading(false);
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*, rank:ranks(name)')
            .eq('id', session.user.id)
            .single();
          setUser(profile as User);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
    alert('Check your email for the login link!');
    router.push('/');
  };

  const signup = async (email: string, rank: Rank) => {
    // This will be handled by a server-side flow for security
    // For now, we just create the user
    const { data, error } = await supabase.auth.signUp({ email });
    if (error) throw error;
    if (!data.user) throw new Error('Signup failed: no user returned');

    // In a real app, you'd have a server-side function to create the profile
    // and assign the rank based on the invite code.
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      email: data.user.email,
      name: 'New Member',
      rank_id: 1, // Default to Errant
    });

    if (profileError) throw profileError;

    alert('Check your email to confirm your signup!');
    router.push('/');
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  };

  const value = { user, loading, login, logout, signup };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
