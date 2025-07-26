import type { NavItem } from '@/lib/types';
import { LayoutDashboard, Bot, MessageSquare } from 'lucide-react';

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
  {
    label: 'Messenger',
    icon: MessageSquare,
    minRank: 'Errante',
    subItems: [
        { href: '/dashboard/messenger/clan', label: 'Clan Chat' },
        { href: '/dashboard/messenger/dm', label: 'Direct Message' },
    ]
  }
];
