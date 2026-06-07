'use client';

import { useQuery } from '@tanstack/react-query';
import { CreditCard, PiggyBank, UserCheck } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <div className='space-y-4'>
      <h1 className='h2'>Dashboard Admin</h1>
      <div className='grid gap-4 sm:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center gap-2 pb-2 space-y-0'>
            <UserCheck className='text-primary size-5' />
            <CardTitle className='text-sm'>Verifikasi Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h3'>
              {isLoading ? '—' : (data?.pendingVerifications ?? 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center gap-2 pb-2 space-y-0'>
            <CreditCard className='text-primary size-5' />
            <CardTitle className='text-sm'>Pembayaran Diperiksa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h3'>
              {isLoading ? '—' : (data?.underReviewPayments ?? 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center gap-2 pb-2 space-y-0'>
            <PiggyBank className='text-primary size-5' />
            <CardTitle className='text-sm'>Pencairan Diajukan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h3'>
              {isLoading ? '—' : (data?.requestedPayouts ?? 0)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
