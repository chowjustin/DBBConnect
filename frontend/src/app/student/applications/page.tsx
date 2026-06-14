'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { GraduationCap, Search } from 'lucide-react';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { formatDateId } from '@/lib/format';
import { usePagination } from '@/hooks/use-pagination';
import type { PaginatedApiResponse } from '@/types/api';
import type { ApplicationStatus } from '@/types/shared';

interface ApplicationRow {
  id: string;
  status: ApplicationStatus;
  message: string | null;
  createdAt: string;
  tutor: {
    id: string;
    whatsappNumber: string | null;
    user: { name: string };
  };
}

type Tab = 'accepted' | 'pending' | 'history';

export default function StudentApplicationsPage() {
  const { params } = usePagination();
  const [tab, setTab] = React.useState<Tab>('accepted');

  const statusParam =
    tab === 'accepted'
      ? 'ACCEPTED'
      : tab === 'pending'
        ? 'PENDING'
        : 'REJECTED';

  const { data, isLoading } = useQuery<{
    data: ApplicationRow[];
    meta: PaginatedApiResponse<ApplicationRow[]>['meta'];
  }>({
    queryKey: ['/applications/student', params, statusParam],
    queryFn: async () => {
      const res = await api.get('/applications/student', {
        params: { ...params, status: statusParam },
      });
      return res.data;
    },
  });

  const rows = data?.data ?? [];

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <PageHeader
          icon={GraduationCap}
          title='Tutor Saya'
          description='Tutor yang telah Anda lamar dan diterima.'
        />
        <Button asChild>
          <Link href='/student/tutors'>
            <Search className='size-4' />
            Cari Tutor
          </Link>
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList>
          <TabsTrigger value='accepted'>Aktif</TabsTrigger>
          <TabsTrigger value='pending'>Menunggu</TabsTrigger>
          <TabsTrigger value='history'>Ditolak</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className='h-40 rounded-lg' />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={
            tab === 'accepted'
              ? 'Belum ada tutor aktif'
              : tab === 'pending'
                ? 'Tidak ada aplikasi menunggu'
                : 'Belum ada aplikasi ditolak'
          }
          description={
            tab === 'accepted'
              ? 'Cari tutor dan kirim aplikasi untuk mulai belajar.'
              : tab === 'pending'
                ? 'Aplikasi yang sedang menunggu jawaban tutor akan muncul di sini.'
                : 'Aplikasi yang ditolak tutor akan muncul di sini.'
          }
          action={
            tab === 'accepted' ? (
              <Button asChild>
                <Link href='/student/tutors'>
                  <Search className='size-4' />
                  Cari Tutor
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {rows.map((app) => (
            <article
              key={app.id}
              className='border-primary-100 hover:border-primary-300 hover:shadow-primary-500/5 flex flex-col gap-3 rounded-lg border bg-white p-4 transition-all hover:shadow-md'
            >
              <div className='flex items-start justify-between gap-2'>
                <div className='from-primary-400 to-primary-600 flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white'>
                  {app.tutor.user.name.charAt(0).toUpperCase()}
                </div>
                <StatusBadge kind='application' status={app.status} size='sm' />
              </div>
              <div className='min-w-0 flex-1'>
                <Link
                  href={`/student/tutors/${app.tutor.id}`}
                  className='hover:text-primary-700 truncate font-semibold underline-offset-2 hover:underline'
                >
                  {app.tutor.user.name}
                </Link>
                {app.message ? (
                  <p className='text-muted-foreground mt-2 line-clamp-2 text-xs'>
                    “{app.message}”
                  </p>
                ) : null}
                <div className='text-muted-foreground mono mt-2 text-[11px] tabular-nums'>
                  {formatDateId(app.createdAt)}
                </div>
              </div>
              {app.status === 'ACCEPTED' ? (
                <div className='mt-auto flex flex-wrap gap-2'>
                  <WhatsAppButton
                    phone={app.tutor.whatsappNumber}
                    message={`Halo ${app.tutor.user.name}, saya siswa Anda di TutorConnect.`}
                  />
                  <Button asChild size='sm' variant='outline'>
                    <Link href={`/student/book?tutor=${app.tutor.id}`}>
                      Pesan Sesi
                    </Link>
                  </Button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
