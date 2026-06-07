'use client';

import { useQuery } from '@tanstack/react-query';
import { CalendarDays, ListChecks, Wallet } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
    <div className='space-y-4'>
      <h1 className='h2'>Dashboard Tutor</h1>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          icon={<Wallet className='size-5' />}
          label='Penghasilan Bulan Ini'
          value={isLoading ? '—' : formatRupiah(data?.earningsThisMonth ?? 0)}
        />
        <StatCard
          icon={<Wallet className='size-5' />}
          label='Total Penghasilan'
          value={isLoading ? '—' : formatRupiah(data?.totalEarnings ?? 0)}
        />
        <StatCard
          icon={<ListChecks className='size-5' />}
          label='Aplikasi Pending'
          value={isLoading ? '—' : String(data?.pendingApplications ?? 0)}
        />
        <StatCard
          icon={<CalendarDays className='size-5' />}
          label='Sesi Mendatang'
          value={isLoading ? '—' : String(data?.upcomingSessions ?? 0)}
        />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center gap-2 space-y-0 pb-2'>
        <span className='text-primary'>{icon}</span>
        <CardTitle className='text-sm font-medium'>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='h3'>{value}</div>
      </CardContent>
    </Card>
  );
}
