'use client';

import { useQuery } from '@tanstack/react-query';
import {
  CalendarDays,
  LayoutDashboard,
  ListChecks,
  TrendingUp,
  Wallet,
} from 'lucide-react';

import { PageHeader } from '@/components/ui/page-header';
import { KpiCard } from '@/components/ui/kpi-card';
import { formatRupiah } from '@/lib/format';

interface TutorDashboard {
  earningsThisMonth: number;
  totalEarnings: number;
  pendingApplications: number;
  upcomingSessions: number;
  rating: number;
}

export default function TutorDashboardPage() {
  const { data, isLoading } = useQuery<TutorDashboard>({
    queryKey: ['/dashboards/tutor'],
  });

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={LayoutDashboard}
        title='Dashboard Tutor'
        description='Ringkasan penghasilan, aplikasi dan jadwal Anda.'
      />
      <div className='stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <KpiCard
          icon={Wallet}
          accent='primary'
          label='Bulan Ini'
          value={formatRupiah(data?.earningsThisMonth ?? 0)}
          loading={isLoading}
        />
        <KpiCard
          icon={TrendingUp}
          accent='emerald'
          label='Total Penghasilan'
          value={formatRupiah(data?.totalEarnings ?? 0)}
          loading={isLoading}
        />
        <KpiCard
          icon={ListChecks}
          accent='amber'
          label='Aplikasi Pending'
          value={String(data?.pendingApplications ?? 0)}
          loading={isLoading}
        />
        <KpiCard
          icon={CalendarDays}
          accent='sky'
          label='Sesi Mendatang'
          value={String(data?.upcomingSessions ?? 0)}
          loading={isLoading}
        />
      </div>
    </div>
  );
}
