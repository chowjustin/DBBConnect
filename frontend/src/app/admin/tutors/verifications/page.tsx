'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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

  return (
    <div className='space-y-4'>
      <h1 className='h2'>Verifikasi Tutor</h1>
      {isLoading ? (
        <Skeleton className='h-40 w-full' />
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
                  <div>{v.user.name}</div>
                  <div className='text-muted-foreground text-xs'>
                    {v.user.email}
                  </div>
                </TableCell>
                <TableCell className='space-x-2 text-xs'>
                  {v.idDocumentUrl ? (
                    <a
                      href={resolveFileUrl(v.idDocumentUrl)}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-primary underline'
                    >
                      KTP
                    </a>
                  ) : null}
                  {v.educationProofUrl ? (
                    <a
                      href={resolveFileUrl(v.educationProofUrl)}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-primary underline'
                    >
                      Ijazah
                    </a>
                  ) : null}
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
    </div>
  );
}
