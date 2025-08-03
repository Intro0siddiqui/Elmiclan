import type { NavItem } from '@/lib/types';
import { LayoutDashboard, Bot, MessageSquare, Send } from 'lucide-react';



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
    href: '/dashboard/messenger/clan',
    label: 'Clan Chat',
    icon: MessageSquare,
    minRank: 'Errante',
  },
  {
    href: '/dashboard/messenger/dm',
    label: 'Direct Message',
    icon: Send,
    minRank: 'Errante',
  }
];
