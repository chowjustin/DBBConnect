'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, ZoomIn } from 'lucide-react';

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
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { formatDateTimeId, formatRupiah } from '@/lib/format';
import { resolveFileUrl } from '@/lib/file-url';
import { usePagination } from '@/hooks/use-pagination';
import type { PaginatedApiResponse } from '@/types/api';
import type { PaymentItem } from '@/app/student/payments/types';

import { useConfirmPayment, useRejectPayment } from './hooks/mutation';

export default function AdminPaymentsPage() {
  const { params } = usePagination();
  const confirm = useConfirmPayment();
  const reject = useRejectPayment();

  const { data, isLoading } = useQuery<{
    data: PaymentItem[];
    meta: PaginatedApiResponse<PaymentItem[]>['meta'];
  }>({
    queryKey: ['/admin/payments', params],
    queryFn: async () => {
      const res = await api.get('/admin/payments', { params });
      return res.data;
    },
  });

  const [lightboxSrc, setLightboxSrc] = React.useState<string | null>(null);

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={CreditCard}
        title='Antrian Pembayaran'
        description='Verifikasi bukti pembayaran dari siswa.'
      />
      {isLoading ? (
        <Skeleton className='h-40 w-full' />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Nominal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bukti</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((p) => {
              return (
                <TableRow key={p.id}>
                  <TableCell>{formatDateTimeId(p.createdAt)}</TableCell>
                  <TableCell>{p.kind}</TableCell>
                  <TableCell className='mono'>
                    {formatRupiah(p.netAmount)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge kind='payment' status={p.status} />
                  </TableCell>
                  <TableCell>
                    {p.proofUrl ? (
                      <button
                        type='button'
                        onClick={() =>
                          setLightboxSrc(resolveFileUrl(p.proofUrl!))
                        }
                        className='text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 text-xs font-medium'
                      >
                        <ZoomIn className='size-3.5' /> Lihat
                      </button>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    {p.status === 'UNDER_REVIEW' ? (
                      <div className='flex gap-2'>
                        <Button
                          size='sm'
                          onClick={() => confirm.mutate(p.id)}
                          disabled={confirm.isPending}
                        >
                          Konfirmasi
                        </Button>
                        <Button
                          size='sm'
                          variant='destructive'
                          onClick={() =>
                            reject.mutate({
                              id: p.id,
                              notes: prompt('Alasan?') ?? undefined,
                            })
                          }
                          disabled={reject.isPending}
                        >
                          Tolak
                        </Button>
                      </div>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
      <ImageLightbox
        open={!!lightboxSrc}
        onClose={() => setLightboxSrc(null)}
        slides={lightboxSrc ? [{ src: lightboxSrc }] : []}
      />
    </div>
  );
}
