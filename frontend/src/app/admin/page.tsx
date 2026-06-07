'use client';

import { useQuery } from '@tanstack/react-query';
import { CreditCard, LayoutDashboard, PiggyBank, UserCheck } from 'lucide-react';

import { PageHeader } from '@/components/ui/page-header';
import { KpiCard } from '@/components/ui/kpi-card';

interface AdminOverview {
  pendingVerifications: number;
  underReviewPayments: number;
  requestedPayouts: number;
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery<AdminOverview>({
    queryKey: ['/admin/analytics/overview'],
  });

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={LayoutDashboard}
        title='Dashboard Admin'
        description='Antrian verifikasi, pembayaran dan pencairan.'
      />
      <div className='stagger-children grid gap-4 sm:grid-cols-3'>
        <KpiCard
          icon={UserCheck}
          accent='primary'
          label='Verifikasi Pending'
          value={String(data?.pendingVerifications ?? 0)}
          loading={isLoading}
        />
        <KpiCard
          icon={CreditCard}
          accent='sky'
          label='Pembayaran Diperiksa'
          value={String(data?.underReviewPayments ?? 0)}
          loading={isLoading}
        />
        <KpiCard
          icon={PiggyBank}
          accent='amber'
          label='Pencairan Diajukan'
          value={String(data?.requestedPayouts ?? 0)}
          loading={isLoading}
        />
      </div>
    </div>
  );
}
