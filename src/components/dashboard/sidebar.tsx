
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { NAV_ITEMS } from '@/lib/constants';
import { useAuth } from '@/hooks/use-auth';
import { rankHierarchy } from '@/lib/types';

export function DashboardSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const availableNavItems = NAV_ITEMS.filter(item => 
    rankHierarchy[user.rank] >= rankHierarchy[item.minRank]
  );

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8 text-primary" />
          <span className="text-lg font-semibold">ElmiClan</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {availableNavItems.map((item) => (
            <SidebarMenuItem key={item.label}>
                <Link href={item.href!}>
                    <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label, side: 'right' }}
                    >
                    <item.icon />
                    <span>{item.label}</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {/* Can add footer items here if needed */}
      </SidebarFooter>
    </Sidebar>
  );
}
