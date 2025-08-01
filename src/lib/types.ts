import type { LucideIcon } from 'lucide-react';
import { z } from 'zod';

export const Rank = z.enum(["Errante", "Scout", "Conquistador", "Admin"]);
export type Rank = z.infer<typeof Rank>;

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

export const MessageSchema = z.object({
    id: z.string(),
    type: z.enum(['message', 'event']),
    sender: z.string(),
    content: z.string(),
    timestamp: z.number(),
});
