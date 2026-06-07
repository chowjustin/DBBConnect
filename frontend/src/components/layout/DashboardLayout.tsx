'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { GraduationCap, LogOut } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { clearTokens } from '@/lib/cookie';
import useAuthStore from '@/store/use-auth-store';
import { SIDEBAR_ENTRIES } from './sidebar-entries';
import type { Role, User } from '@/types/shared';

interface DashboardLayoutProps {
  role: Role;
  user: User;
  children: React.ReactNode;
}

export function DashboardLayout({ role, user, children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore.useLogout();
  const entries = SIDEBAR_ENTRIES[role];

  const handleLogout = () => {
    clearTokens();
    logout();
    router.replace('/auth/login');
  };

  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <SidebarProvider>
      <Sidebar collapsible='icon'>
        <SidebarHeader>
          <Link
            href={entries[0]?.href ?? '/'}
            className='flex items-center gap-2 px-2 py-1.5'
          >
            <GraduationCap className='text-primary size-5 shrink-0' />
            <span className='truncate text-sm font-bold group-data-[collapsible=icon]:hidden'>
              DBBConnect
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {entries.map((entry) => {
                  const active =
                    pathname === entry.href ||
                    (entry.href !== `/${role.toLowerCase()}` &&
                      pathname?.startsWith(entry.href));
                  return (
                    <SidebarMenuItem key={entry.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={entry.label}
                        className={
                          active
                            ? 'bg-primary-100 text-primary-700 font-semibold hover:bg-primary-100 hover:text-primary-700 data-[active=true]:bg-primary-100 data-[active=true]:text-primary-700'
                            : 'hover:bg-primary-50 hover:text-primary-700'
                        }
                      >
                        <Link href={entry.href}>
                          <entry.icon className='size-4 shrink-0' />
                          <span>{entry.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip='Logout'>
                <LogOut className='size-4 shrink-0' />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className='sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-primary-100/60 bg-white/70 px-4 backdrop-blur-xl'>
          <SidebarTrigger />
          <Separator orientation='vertical' className='h-6' />
          <div className='flex-1' />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm' className='gap-2 px-2'>
                <Avatar className='size-8 ring-2 ring-primary-100'>
                  <AvatarFallback className='bg-gradient-to-br from-primary-400 to-primary-600 text-xs font-bold text-white'>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className='hidden text-sm font-medium sm:inline'>
                  {user.name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              <DropdownMenuLabel className='font-normal'>
                <div className='text-sm font-semibold'>{user.name}</div>
                <div className='text-muted-foreground text-xs'>
                  {user.email}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className='size-4' />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className='dashboard-layout animate-page-in py-8'>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
