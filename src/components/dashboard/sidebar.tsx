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
  SidebarMenuSub,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Logo } from '@/components/icons';
import { NAV_ITEMS } from '@/lib/constants';
import { useAuth } from '@/hooks/use-auth';
import { rankHierarchy } from '@/lib/types';
import { ChevronDown } from 'lucide-react';

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
        <Accordion type="multiple" className="w-full">
        <SidebarMenu>
          {availableNavItems.map((item, index) => (
            <SidebarMenuItem key={item.label}>
              {item.subItems ? (
                 <AccordionItem value={`item-${index}`} className="border-b-0">
                    <AccordionTrigger className="w-full hover:no-underline [&[data-state=open]>svg]:rotate-180">
                        <SidebarMenuButton asChild isActive={item.subItems.some(sub => pathname.startsWith(sub.href))} className="p-0 bg-transparent hover:bg-transparent text-base">
                             <div className="flex items-center gap-2">
                                <item.icon />
                                <span>{item.label}</span>
                             </div>
                        </SidebarMenuButton>
                    </AccordionTrigger>
                    <AccordionContent>
                      <SidebarMenuSub>
                        {item.subItems.map(subItem => (
                          <SidebarMenuSubItem key={subItem.href}>
                              <Link href={subItem.href} legacyBehavior passHref>
                                <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                                  <a>{subItem.label}</a>
                                </SidebarMenuSubButton>
                              </Link>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </AccordionContent>
                </AccordionItem>
              ) : (
                <Link href={item.href!}>
                    <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label, side: 'right' }}
                    >
                    <item.icon />
                    <span>{item.label}</span>
                    </SidebarMenuButton>
                </Link>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        </Accordion>
      </SidebarContent>
      <SidebarFooter>
        {/* Can add footer items here if needed */}
      </SidebarFooter>
    </Sidebar>
  );
}
