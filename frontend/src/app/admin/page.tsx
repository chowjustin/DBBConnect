'use client';

import { useQuery } from '@tanstack/react-query';
import {
  CreditCard,
  LayoutDashboard,
  PiggyBank,
  UserCheck,
} from 'lucide-react';

import { PageHeader } from '@/components/ui/page-header';
import { KpiCard } from '@/components/ui/kpi-card';

interface QueueCounts {
  pending: number;
  done: number;
  total: number;
}

interface AdminOverview {
  queues: {
    verifications: QueueCounts;
    payments: QueueCounts;
    payouts: QueueCounts;
  };
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery<AdminOverview>({
    queryKey: ['/admin/analytics/overview'],
  });

  const q = data?.queues;

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
          label='Verifikasi Tutor'
          value={String(q?.verifications.pending ?? 0)}
          unit='pending'
          sublabel={
            q
              ? `${q.verifications.done} / ${q.verifications.total} selesai`
              : '—'
          }
          loading={isLoading}
        />
        <KpiCard
          icon={CreditCard}
          accent='sky'
          label='Pembayaran'
          value={String(q?.payments.pending ?? 0)}
          unit='pending'
          sublabel={
            q ? `${q.payments.done} / ${q.payments.total} selesai` : '—'
          }
          loading={isLoading}
        />
        <KpiCard
          icon={PiggyBank}
          accent='amber'
          label='Pencairan'
          value={String(q?.payouts.pending ?? 0)}
          unit='pending'
          sublabel={q ? `${q.payouts.done} / ${q.payouts.total} selesai` : '—'}
          loading={isLoading}
        />
      </div>
    </div>
  );
}
