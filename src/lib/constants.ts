import type { NavItem } from '@/lib/types';
import { LayoutDashboard, Bot } from 'lucide-react';

export const VALID_INVITE_CODES = ['ELMI-2024', 'SCOUT-AHEAD', 'CONQUER'];

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    minRank: 'Errante',
  },
  {
    href: '/dashboard/rank-advisor',
    label: 'Rank Advisor',
    icon: Bot,
    minRank: 'Errante',
  },
];
