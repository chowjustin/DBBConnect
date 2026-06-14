'use client';

import { LogOut, User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
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
import { clearTokens } from '@/lib/cookie';
import useAuthStore from '@/store/use-auth-store';
import type { Role, User } from '@/types/shared';

import { SIDEBAR_ENTRIES } from './sidebar-entries';

interface DashboardLayoutProps {
  role: Role;
  user: User;
  children: React.ReactNode;
}

export function DashboardLayout({
  role,
  user,
  children,
}: DashboardLayoutProps) {
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
            <Image
              src='/logo-tutorconnect.png'
              alt='TutorConnect Logo'
              width={32}
              height={32}
            />
            <span className='truncate text-sm font-bold group-data-[collapsible=icon]:hidden'>
              TutorConnect
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
                            ? 'bg-primary-100 text-primary-700 hover:bg-primary-100 hover:text-primary-700 data-[active=true]:bg-primary-100 data-[active=true]:text-primary-700 font-semibold'
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
        <header className='border-primary-100/60 sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-white/70 px-4 backdrop-blur-xl'>
          <SidebarTrigger />
          <Separator orientation='vertical' className='h-6' />
          <div className='flex-1' />
          <kbd className='bg-primary-50 text-primary-700 border-primary-200 hidden h-7 items-center gap-1 rounded-md border px-2 text-xs font-medium md:inline-flex'>
            <span className='mono text-[10px]'>⌘</span>K
          </kbd>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm' className='gap-2 px-2'>
                <Avatar className='ring-primary-100 size-8 ring-2'>
                  <AvatarFallback className='from-primary-400 to-primary-600 bg-gradient-to-br text-xs font-bold text-white'>
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
              <DropdownMenuItem asChild>
                <Link href={`/${role.toLowerCase()}/profile`}>
                  <UserIcon className='size-4' />
                  Profil
                </Link>
              </DropdownMenuItem>
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
