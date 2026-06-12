'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
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
  student: { user: { name: string; email: string } };
}

export default function TutorApplicationsPage() {
  const { params } = usePagination();
  const updateStatus = useUpdateApplicationStatus();
  const [acceptTarget, setAcceptTarget] = React.useState<{
    id: string;
    name: string;
  } | null>(null);
  const [rejectTarget, setRejectTarget] = React.useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data, isLoading } = useQuery<{
    data: ApplicationRow[];
    meta: PaginatedApiResponse<ApplicationRow[]>['meta'];
  }>({
    queryKey: ['/applications/tutor', params],
    queryFn: async () => {
      const res = await api.get('/applications/tutor', { params });
      return res.data;
    },
  });

  return (
    <div className='space-y-4'>
      <h1 className='h2'>Aplikasi Siswa</h1>
      {isLoading ? (
        <Skeleton className='h-40 w-full' />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Siswa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pesan</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.length === 0 ? (
              <TableEmpty colSpan={5}>Belum ada aplikasi siswa.</TableEmpty>
            ) : (
              data?.data.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div>{app.student.user.name}</div>
                    <div className='text-muted-foreground text-xs'>
                      {app.student.user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge kind='application' status={app.status} />
                  </TableCell>
                  <TableCell className='max-w-xs truncate'>
                    {app.message ?? '—'}
                  </TableCell>
                  <TableCell>{formatDateId(app.createdAt)}</TableCell>
                  <TableCell>
                    {app.status === 'PENDING' ? (
                      <div className='flex gap-2'>
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
                      </div>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
