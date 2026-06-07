'use client';

import { useQuery } from '@tanstack/react-query';

import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PAYMENT_STATUS } from '@/lib/status';
import { formatDateTimeId, formatRupiah } from '@/lib/format';
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

  return (
    <div className='space-y-6'>
      <h1 className='h2'>Pembayaran</h1>

      <Card>
        <CardHeader>
          <CardTitle>Instruksi Transfer</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3 text-sm'>
          {instructionsQ.isLoading ? (
            <Skeleton className='h-20 w-full' />
          ) : (
            (instructionsQ.data ?? []).map((b) => (
              <div key={b.id} className='rounded-md border p-3'>
                <div className='font-semibold'>{b.bankName}</div>
                <div>{b.accountNumber} a.n. {b.accountHolder}</div>
                {b.notes ? (
                  <div className='text-muted-foreground text-xs'>
                    {b.notes}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          {listQ.isLoading ? (
            <Skeleton className='h-40 w-full' />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Nominal</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listQ.data?.data.map((p) => {
                  const m = PAYMENT_STATUS[p.status];
                  return (
                    <TableRow key={p.id}>
                      <TableCell>{formatDateTimeId(p.createdAt)}</TableCell>
                      <TableCell>{p.kind}</TableCell>
                      <TableCell>{formatRupiah(p.netAmount)}</TableCell>
                      <TableCell>
                        <Badge className={`${m.className} border-0`}>
                          {m.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
