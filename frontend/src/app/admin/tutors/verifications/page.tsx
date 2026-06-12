'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserCheck, ZoomIn } from 'lucide-react';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { resolveFileUrl } from '@/lib/file-url';
import { usePagination } from '@/hooks/use-pagination';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';
import type { PaginatedApiResponse } from '@/types/api';

interface VerificationItem {
  id: string;
  bio: string | null;
  idDocumentUrl: string | null;
  educationProofUrl: string | null;
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  user: { id: string; name: string; email: string };
}

export default function AdminVerificationsPage() {
  const qc = useQueryClient();
  const { params } = usePagination();
  const [history, setHistory] = React.useState(false);

  const [slides, setSlides] = React.useState<{ src: string }[]>([]);
  const [open, setOpen] = React.useState(false);
  const [approveTarget, setApproveTarget] = React.useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = React.useState<string | null>(null);

  const endpoint = history
    ? '/admin/tutors/verification/history'
    : '/admin/tutors/verification';
  const { data, isLoading } = useQuery<{
    data: VerificationItem[];
    meta: PaginatedApiResponse<VerificationItem[]>['meta'];
  }>({
    queryKey: [endpoint, params],
    queryFn: async () => {
      const res = await api.get(endpoint, { params });
      return res.data;
    },
  });

  const review = useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: 'VERIFIED' | 'REJECTED';
      notes?: string;
    }) => {
      const res = await api.patch(`/admin/tutors/${id}/verification`, {
        status,
        notes,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/admin/tutors/verification'] });
      qc.invalidateQueries({
        queryKey: ['/admin/tutors/verification/history'],
      });
      notifySuccess('Verifikasi diperbarui');
    },
    onError: (e) => notifyAxiosError(e),
  });

  const showDocs = (v: VerificationItem) => {
    const list: { src: string }[] = [];
    if (v.idDocumentUrl) list.push({ src: resolveFileUrl(v.idDocumentUrl) });
    if (v.educationProofUrl)
      list.push({ src: resolveFileUrl(v.educationProofUrl) });
    if (!list.length) return;
    setSlides(list);
    setOpen(true);
  };

  const empty = !isLoading && (data?.data.length ?? 0) === 0;

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={UserCheck}
        title={history ? 'Riwayat Verifikasi' : 'Verifikasi Tutor'}
        description={
          history
            ? 'Tutor yang sudah disetujui atau ditolak.'
            : 'Tinjau dokumen identitas dan ijazah.'
        }
      />
      <Tabs
        value={history ? 'history' : 'queue'}
        onValueChange={(v) => setHistory(v === 'history')}
      >
        <TabsList>
          <TabsTrigger value='queue'>Antrian</TabsTrigger>
          <TabsTrigger value='history'>Riwayat</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <Skeleton className='h-40 w-full' />
      ) : empty ? (
        <EmptyState
          icon={UserCheck}
          title='Tidak ada antrian'
          description='Semua tutor terverifikasi sudah ditinjau.'
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tutor</TableHead>
              <TableHead>Dokumen</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((v) => (
              <TableRow key={v.id}>
                <TableCell>
                  <div className='font-medium'>{v.user.name}</div>
                  <div className='text-muted-foreground text-xs'>
                    {v.user.email}
                  </div>
                </TableCell>
                <TableCell>
                  {v.idDocumentUrl || v.educationProofUrl ? (
                    <button
                      type='button'
                      onClick={() => showDocs(v)}
                      className='text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 text-xs font-medium'
                    >
                      <ZoomIn className='size-3.5' /> Lihat dokumen
                    </button>
                  ) : (
                    <span className='text-muted-foreground text-xs'>
                      Belum upload
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {history ? (
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                        v.verificationStatus === 'VERIFIED'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-rose-200 bg-rose-50 text-rose-700'
                      }`}
                    >
                      {v.verificationStatus === 'VERIFIED'
                        ? 'Disetujui'
                        : 'Ditolak'}
                    </span>
                  ) : (
                    <div className='flex gap-2'>
                      <Button size='sm' onClick={() => setApproveTarget(v.id)}>
                        Setujui
                      </Button>
                      <Button
                        size='sm'
                        variant='destructive'
                        onClick={() => setRejectTarget(v.id)}
                      >
                        Tolak
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ImageLightbox
        open={open}
        onClose={() => setOpen(false)}
        slides={slides}
      />

      <ConfirmDialog
        open={!!approveTarget}
        onOpenChange={(v) => !v && setApproveTarget(null)}
        title='Setujui verifikasi tutor?'
        description='Tutor akan dapat mempublikasikan profil dan menerima siswa.'
        confirmLabel='Ya, setujui'
        loading={review.isPending}
        onConfirm={() => {
          if (!approveTarget) return;
          review.mutate(
            { id: approveTarget, status: 'VERIFIED' },
            { onSuccess: () => setApproveTarget(null) },
          );
        }}
      />

      <ConfirmDialog
        open={!!rejectTarget}
        onOpenChange={(v) => !v && setRejectTarget(null)}
        tone='danger'
        title='Tolak verifikasi tutor?'
        description='Tutor diberi tahu alasan penolakan dan dapat unggah ulang dokumen.'
        confirmLabel='Tolak'
        noteLabel='Alasan penolakan'
        notePlaceholder='Misal: KTP tidak jelas, ijazah tidak terbaca...'
        noteRequired
        loading={review.isPending}
        onConfirm={(note) => {
          if (!rejectTarget) return;
          review.mutate(
            { id: rejectTarget, status: 'REJECTED', notes: note },
            { onSuccess: () => setRejectTarget(null) },
          );
        }}
      />
    </div>
  );
}
