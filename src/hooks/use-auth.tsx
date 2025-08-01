
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User, Rank } from '@/lib/types';

// Mock user data - EXPORTED so other components can use it for mock data.
export const MOCK_USERS: Record<string, User> = {
  'errante@elmiclan.com': { id: '1789785831533101057', name: 'Alex Erra', rank: 'Errante', email: 'errante@elmiclan.com', profile: { skills: ['Foraging', 'Basic First Aid'], achievements: ['Joined the clan'], activity: 'Low' } },
  'scout@elmiclan.com': { id: '1789785835827363841', name: 'Sam Scout', rank: 'Scout', email: 'scout@elmiclan.com', profile: { skills: ['Pathfinding', 'Stealth', 'Archery'], achievements: ['Mapped the Whispering Woods', 'First to spot the northern ridge'], activity: 'High' } },
  'conquistador@elmiclan.com': { id: '1789785839425519619', name: 'Chris Conq', rank: 'Conquistador', email: 'conquistador@elmiclan.com', profile: { skills: ['Leadership', 'Advanced Combat', 'Strategy'], achievements: ['Claimed the Sunstone Quarry', 'Established 3 outposts'], activity: 'Medium' } },
  'admin@elmiclan.com': { id: '1789785842289967111', name: 'Ada Admin', rank: 'Admin', email: 'admin@elmiclan.com', profile: { skills: ['System Administration', 'Clan Management'], achievements: ['Built the portal'], activity: 'High' } },
};

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
    try {
      const storedUser = localStorage.getItem('elmiclan-user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Re-sync with MOCK_USERS to ensure data is not stale
        const freshUser = MOCK_USERS[parsedUser.email.toLowerCase()];
        if (freshUser) {
          setUser(freshUser);
        } else {
          setUser(parsedUser);
        }
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('elmiclan-user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string) => {
    setLoading(true);
    const mockUser = MOCK_USERS[email.toLowerCase()];
    if (mockUser) {
      setUser(mockUser);
      localStorage.setItem('elmiclan-user', JSON.stringify(mockUser));
      router.push('/dashboard');
    } else {
      setLoading(false);
      throw new Error('User not found. Try one of the example emails.');
    }
  };

  const signup = async (email: string, rank: Rank) => {
    setLoading(true);
    const newId = (BigInt(Date.now()) * BigInt(1000000) + BigInt(Math.floor(Math.random() * 1000000))).toString();

    const newUser: User = {
      id: newId,
      name: 'New Member',
      email,
      rank,
      profile: {
        skills: ['Newcomer'],
        achievements: ['Successfully registered'],
        activity: 'New',
      },
    };
    
    MOCK_USERS[email.toLowerCase()] = newUser;
    
    setUser(newUser);
    localStorage.setItem('elmiclan-user', JSON.stringify(newUser));
    router.push('/dashboard');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('elmiclan-user');
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
