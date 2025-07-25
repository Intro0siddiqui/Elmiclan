import { create } from 'zustand';
import type { Rank } from '@/lib/types';

interface UserState {
  userRank: Rank | null;
  permissions: string[];
  setRank: (rank: Rank) => void;
  setPermissions: (permissions: string[]) => void;
  clearState: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  userRank: null,
  permissions: [],
  setRank: (rank) => set({ userRank: rank }),
  setPermissions: (permissions) => set({ permissions }),
  clearState: () => set({ userRank: null, permissions: [] }),
}));
