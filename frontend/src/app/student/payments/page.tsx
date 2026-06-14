'use client';

import { useQuery } from '@tanstack/react-query';
import { Wallet } from 'lucide-react';

import api from '@/lib/api';
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
import { EmptyState } from '@/components/ui/empty-state';
import { formatDateTimeId, formatRupiah } from '@/lib/format';
import { paymentKindLabel } from '@/constant/enums';
import { usePagination } from '@/hooks/use-pagination';
import type { PaginatedApiResponse } from '@/types/api';

import type { PaymentItem, PlatformBank } from './types';

export default function StudentPaymentsPage() {
  const { params } = usePagination();

  const instructionsQ = useQuery<PlatformBank[]>({
    queryKey: ['/payment-instructions'],
  });

  const listQ = useQuery<{
    data: PaymentItem[];
    meta: PaginatedApiResponse<PaymentItem[]>['meta'];
  }>({
    queryKey: ['/payments/mine', params],
    queryFn: async () => {
      const res = await api.get('/payments/mine', { params });
      return res.data;
    },
  });

  const empty = !listQ.isLoading && (listQ.data?.data.length ?? 0) === 0;

  return (
    <div className='space-y-8'>
      <PageHeader
        icon={Wallet}
        title='Pembayaran'
        description='Instruksi transfer dan riwayat pembayaran Anda.'
      />

      {/* Instructions: tight inline list, no Card */}
      <section>
        <h2 className='text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase'>
          Instruksi Transfer
        </h2>
        {instructionsQ.isLoading ? (
          <Skeleton className='h-20 w-full' />
        ) : (
          <div className='border-primary-100 divide-primary-100 divide-y rounded-lg border bg-white'>
            {(instructionsQ.data ?? []).map((b) => (
              <div
                key={b.id}
                className='flex flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-3 text-sm'
              >
                <span className='font-semibold'>{b.bankName}</span>
                <span className='mono tabular-nums'>{b.accountNumber}</span>
                <span className='text-muted-foreground'>
                  a.n. {b.accountHolder}
                </span>
                {b.notes ? (
                  <span className='text-muted-foreground basis-full text-xs'>
                    {b.notes}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* History: plain table, no Card */}
      <section>
        <h2 className='text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase'>
          Riwayat Pembayaran
        </h2>
        {listQ.isLoading ? (
          <Skeleton className='h-40 w-full' />
        ) : empty ? (
          <EmptyState
            icon={Wallet}
            title='Belum ada pembayaran'
            description='Riwayat pembayaran akan tampil setelah Anda melakukan transaksi pertama.'
          />
        ) : (
          <div className='border-primary-100 overflow-hidden rounded-lg border bg-white'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead className='text-right'>Nominal</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listQ.data?.data.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className='mono text-muted-foreground text-xs tabular-nums'>
                      {formatDateTimeId(p.createdAt)}
                    </TableCell>
                    <TableCell>{paymentKindLabel(p.kind)}</TableCell>
                    <TableCell className='mono text-right tabular-nums'>
                      {formatRupiah(p.grossAmount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge kind='payment' status={p.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
