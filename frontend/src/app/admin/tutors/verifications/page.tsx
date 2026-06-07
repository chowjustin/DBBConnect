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
import { EmptyState } from '@/components/ui/empty-state';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { resolveFileUrl } from '@/lib/file-url';
import { usePagination } from '@/hooks/use-pagination';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';
import type { PaginatedApiResponse } from '@/types/api';

interface VerificationItem {
  id: string;
  bio: string | null;
  idDocumentUrl: string | null;
  educationProofUrl: string | null;
  user: { id: string; name: string; email: string };
}

export default function AdminVerificationsPage() {
  const qc = useQueryClient();
  const { params } = usePagination();

  const [slides, setSlides] = React.useState<{ src: string }[]>([]);
  const [open, setOpen] = React.useState(false);

  const { data, isLoading } = useQuery<{
    data: VerificationItem[];
    meta: PaginatedApiResponse<VerificationItem[]>['meta'];
  }>({
    queryKey: ['/admin/tutors/verification', params],
    queryFn: async () => {
      const res = await api.get('/admin/tutors/verification', { params });
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
        title='Verifikasi Tutor'
        description='Tinjau dokumen identitas dan ijazah.'
      />

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
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      onClick={() =>
                        review.mutate({ id: v.id, status: 'VERIFIED' })
                      }
                      disabled={review.isPending}
                    >
                      Setujui
                    </Button>
                    <Button
                      size='sm'
                      variant='destructive'
                      onClick={() =>
                        review.mutate({
                          id: v.id,
                          status: 'REJECTED',
                          notes: prompt('Alasan?') ?? undefined,
                        })
                      }
                      disabled={review.isPending}
                    >
                      Tolak
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ImageLightbox open={open} onClose={() => setOpen(false)} slides={slides} />
    </div>
  );
}
