'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Mail, Users } from 'lucide-react';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { formatDateId } from '@/lib/format';
import { usePagination } from '@/hooks/use-pagination';
import type { PaginatedApiResponse } from '@/types/api';
import type { ApplicationStatus } from '@/types/shared';

import { useUpdateApplicationStatus } from './hooks/mutation';

interface ApplicationRow {
  id: string;
  status: ApplicationStatus;
  message: string | null;
  createdAt: string;
  student: {
    whatsappNumber: string | null;
    user: { name: string; email: string };
  };
}

type Tab = 'accepted' | 'pending' | 'history';

export default function TutorApplicationsPage() {
  const { params } = usePagination();
  const updateStatus = useUpdateApplicationStatus();
  const [tab, setTab] = React.useState<Tab>('accepted');
  const [acceptTarget, setAcceptTarget] = React.useState<{
    id: string;
    name: string;
  } | null>(null);
  const [rejectTarget, setRejectTarget] = React.useState<{
    id: string;
    name: string;
  } | null>(null);

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
    queryKey: ['/applications/tutor', params, statusParam],
    queryFn: async () => {
      const res = await api.get('/applications/tutor', {
        params: { ...params, status: statusParam },
      });
      return res.data;
    },
  });

  const rows = data?.data ?? [];

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={Users}
        title='Siswa Saya'
        description='Kelola permintaan siswa yang ingin belajar dengan Anda.'
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList>
          <TabsTrigger value='accepted'>Aktif</TabsTrigger>
          <TabsTrigger value='pending'>Permintaan</TabsTrigger>
          <TabsTrigger value='history'>Riwayat</TabsTrigger>
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
          icon={Users}
          title={
            tab === 'accepted'
              ? 'Belum ada siswa aktif'
              : tab === 'pending'
                ? 'Tidak ada permintaan baru'
                : 'Belum ada riwayat'
          }
          description={
            tab === 'accepted'
              ? 'Siswa yang Anda terima akan muncul di sini.'
              : tab === 'pending'
                ? 'Permintaan siswa baru akan muncul di sini untuk Anda tinjau.'
                : 'Aplikasi yang ditolak akan muncul di sini.'
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
                  {app.student.user.name.charAt(0).toUpperCase()}
                </div>
                <StatusBadge kind='application' status={app.status} size='sm' />
              </div>
              <div className='min-w-0 flex-1'>
                <div className='truncate font-semibold'>
                  {app.student.user.name}
                </div>
                <div className='text-muted-foreground inline-flex items-center gap-1 truncate text-xs'>
                  <Mail className='size-3' />
                  {app.student.user.email}
                </div>
                {app.message ? (
                  <p className='text-muted-foreground mt-2 line-clamp-2 text-xs'>
                    “{app.message}”
                  </p>
                ) : null}
                <div className='text-muted-foreground mono mt-2 text-[11px] tabular-nums'>
                  {formatDateId(app.createdAt)}
                </div>
              </div>
              <div className='mt-auto flex flex-wrap gap-2'>
                {app.status === 'PENDING' ? (
                  <>
                    <Button
                      size='sm'
                      onClick={() =>
                        setAcceptTarget({
                          id: app.id,
                          name: app.student.user.name,
                        })
                      }
                    >
                      Terima
                    </Button>
                    <Button
                      size='sm'
                      variant='destructive'
                      onClick={() =>
                        setRejectTarget({
                          id: app.id,
                          name: app.student.user.name,
                        })
                      }
                    >
                      Tolak
                    </Button>
                  </>
                ) : app.status === 'ACCEPTED' ? (
                  <WhatsAppButton
                    phone={app.student.whatsappNumber}
                    message={`Halo ${app.student.user.name}, saya tutor Anda di TutorConnect.`}
                  />
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!acceptTarget}
        onOpenChange={(v) => !v && setAcceptTarget(null)}
        title='Terima aplikasi siswa?'
        description={
          acceptTarget
            ? `${acceptTarget.name} akan dapat memesan sesi dengan Anda.`
            : undefined
        }
        confirmLabel='Ya, terima'
        loading={updateStatus.isPending}
        onConfirm={() => {
          if (!acceptTarget) return;
          updateStatus.mutate(
            { id: acceptTarget.id, status: 'ACCEPTED' },
            { onSuccess: () => setAcceptTarget(null) },
          );
        }}
      />

      <ConfirmDialog
        open={!!rejectTarget}
        onOpenChange={(v) => !v && setRejectTarget(null)}
        tone='danger'
        title='Tolak aplikasi siswa?'
        description={
          rejectTarget
            ? `${rejectTarget.name} akan diberi tahu aplikasi ditolak.`
            : undefined
        }
        confirmLabel='Tolak'
        loading={updateStatus.isPending}
        onConfirm={() => {
          if (!rejectTarget) return;
          updateStatus.mutate(
            { id: rejectTarget.id, status: 'REJECTED' },
            { onSuccess: () => setRejectTarget(null) },
          );
        }}
      />
    </div>
  );
}
