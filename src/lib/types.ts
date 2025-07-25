import type { LucideIcon } from 'lucide-react';

export type Rank = "Errante" | "Scout" | "Conquistador" | "Admin";

export interface User {
  id: string;
  email: string;
  rank: Rank;
  name: string;
  profile: {
    skills: string[];
    achievements: string[];
    activity: string;
  };
}

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  minRank: Rank;
}

export const rankHierarchy: Record<Rank, number> = {
  "Errante": 1,
  "Scout": 2,
  "Conquistador": 3,
  "Admin": 4
};
