import {
  CalendarDays,
  CreditCard,
  FileText,
  LayoutDashboard,
  ListChecks,
  PiggyBank,
  Receipt,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UserCheck,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

import type { Role } from '@/types/shared';

export interface SidebarEntry {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const SIDEBAR_ENTRIES: Record<Role, SidebarEntry[]> = {
  TUTOR: [
    { label: 'Dashboard', href: '/tutor', icon: LayoutDashboard },
    { label: 'Sesi', href: '/tutor/sessions', icon: CalendarDays },
    { label: 'Siswa', href: '/tutor/applications', icon: ListChecks },
    { label: 'Ketersediaan', href: '/tutor/availability', icon: CalendarDays },
    { label: 'Materi', href: '/tutor/materials', icon: FileText },
    { label: 'Dompet', href: '/tutor/wallet', icon: Wallet },
    { label: 'Pencairan', href: '/tutor/payouts', icon: PiggyBank },
    { label: 'Langganan', href: '/tutor/subscription', icon: CreditCard },
    { label: 'Featured', href: '/tutor/featured', icon: Sparkles },
    { label: 'Ulasan', href: '/tutor/reviews', icon: Star },
  ],
  STUDENT: [
    { label: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { label: 'Sesi', href: '/student/sessions', icon: CalendarDays },
    { label: 'Tutor Saya', href: '/student/applications', icon: ListChecks },
    { label: 'Cari Tutor', href: '/student/tutors', icon: Search },
    { label: 'Pesan Sesi', href: '/student/book', icon: CalendarDays },
    { label: 'Materi', href: '/student/materials', icon: FileText },
    { label: 'Pembayaran', href: '/student/payments', icon: Receipt },
    { label: 'Langganan', href: '/student/subscription', icon: CreditCard },
  ],
  ADMIN: [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Pembayaran', href: '/admin/payments', icon: Receipt },
    { label: 'Pencairan', href: '/admin/payouts', icon: PiggyBank },
    {
      label: 'Verifikasi Tutor',
      href: '/admin/tutors/verifications',
      icon: UserCheck,
    },
    { label: 'Pengguna', href: '/admin/users', icon: Users },
    { label: 'Promo', href: '/admin/promo', icon: Sparkles },
    {
      label: 'Rekening Platform',
      href: '/admin/platform-bank',
      icon: ShieldCheck,
    },
  ],
};
