'use client';

import { useQuery } from '@tanstack/react-query';
import { BookOpen, CalendarDays, LayoutDashboard, Receipt } from 'lucide-react';

import { PageHeader } from '@/components/ui/page-header';
import { KpiCard } from '@/components/ui/kpi-card';

interface StudentDashboard {
  upcomingSessions: number;
  pendingPayments: number;
  materialsCount: number;
  activeSubscription: string | null;
}

export default function StudentDashboardPage() {
  const { data, isLoading } = useQuery<StudentDashboard>({
    queryKey: ['/dashboards/student'],
  });

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={LayoutDashboard}
        title='Dashboard Siswa'
        description='Pantau sesi, pembayaran dan materi belajar Anda.'
      />
      <div className='stagger-children grid gap-4 sm:grid-cols-3'>
        <KpiCard
          icon={CalendarDays}
          accent='primary'
          label='Sesi Mendatang'
          value={String(data?.upcomingSessions ?? 0)}
          loading={isLoading}
        />
        <KpiCard
          icon={Receipt}
          accent='amber'
          label='Pembayaran Pending'
          value={String(data?.pendingPayments ?? 0)}
          loading={isLoading}
        />
        <KpiCard
          icon={BookOpen}
          accent='emerald'
          label='Materi Tersedia'
          value={String(data?.materialsCount ?? 0)}
          loading={isLoading}
        />
      </div>
    </div>
  );
}
