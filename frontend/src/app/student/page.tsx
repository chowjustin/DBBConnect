'use client';

import { useQuery } from '@tanstack/react-query';
import { BookOpen, CalendarDays, Receipt } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <div className='space-y-4'>
      <h1 className='h2'>Dashboard Siswa</h1>
      <div className='grid gap-4 sm:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center gap-2 pb-2 space-y-0'>
            <CalendarDays className='text-primary size-5' />
            <CardTitle className='text-sm'>Sesi Mendatang</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h3'>
              {isLoading ? '—' : (data?.upcomingSessions ?? 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center gap-2 pb-2 space-y-0'>
            <Receipt className='text-primary size-5' />
            <CardTitle className='text-sm'>Pembayaran Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h3'>
              {isLoading ? '—' : (data?.pendingPayments ?? 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center gap-2 pb-2 space-y-0'>
            <BookOpen className='text-primary size-5' />
            <CardTitle className='text-sm'>Materi Tersedia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h3'>
              {isLoading ? '—' : (data?.materialsCount ?? 0)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
