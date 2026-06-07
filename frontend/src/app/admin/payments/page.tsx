'use client';

import { useQuery } from '@tanstack/react-query';

import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
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
import { PAYMENT_STATUS } from '@/lib/status';
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

  return (
    <div className='space-y-4'>
      <h1 className='h2'>Antrian Pembayaran</h1>
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
              const m = PAYMENT_STATUS[p.status];
              return (
                <TableRow key={p.id}>
                  <TableCell>{formatDateTimeId(p.createdAt)}</TableCell>
                  <TableCell>{p.kind}</TableCell>
                  <TableCell>{formatRupiah(p.netAmount)}</TableCell>
                  <TableCell>
                    <Badge className={`${m.className} border-0`}>{m.label}</Badge>
                  </TableCell>
                  <TableCell>
                    {p.proofUrl ? (
                      <a
                        href={resolveFileUrl(p.proofUrl)}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-primary text-xs underline'
                      >
                        Lihat
                      </a>
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
    </div>
  );
}
