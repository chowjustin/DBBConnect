'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { PAYOUT_STATUS } from '@/lib/status';
import { formatDateTimeId, formatRupiah } from '@/lib/format';
import { usePagination } from '@/hooks/use-pagination';
import { MIN_PAYOUT_RUPIAH } from '@/constant/common';
import type { PaginatedApiResponse } from '@/types/api';
import type { PayoutStatus } from '@/types/shared';

import { useRequestPayout } from './hooks/mutation';

interface PayoutItem {
  id: string;
  amount: number;
  status: PayoutStatus;
  requestedAt: string;
  paidAt: string | null;
}

export default function PayoutsPage() {
  const [amount, setAmount] = React.useState('');
  const request = useRequestPayout();
  const { params } = usePagination();

  const { data, isLoading } = useQuery<{
    data: PayoutItem[];
    meta: PaginatedApiResponse<PayoutItem[]>['meta'];
  }>({
    queryKey: ['/tutor/payouts', params],
    queryFn: async () => {
      const res = await api.get('/tutor/payouts', { params });
      return res.data;
    },
  });

  const onSubmit = () => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n < MIN_PAYOUT_RUPIAH) {
      return alert(`Minimum ${formatRupiah(MIN_PAYOUT_RUPIAH)}`);
    }
    request.mutate(n);
  };

  return (
    <div className='space-y-4'>
      <h1 className='h2'>Pencairan</h1>

      <Card>
        <CardHeader>
          <CardTitle>Ajukan Pencairan</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='space-y-1.5'>
            <Label>Jumlah (IDR)</Label>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
              placeholder={String(MIN_PAYOUT_RUPIAH)}
            />
            <p className='text-muted-foreground text-xs'>
              Minimum {formatRupiah(MIN_PAYOUT_RUPIAH)}
            </p>
          </div>
          <Button onClick={onSubmit} disabled={request.isPending}>
            {request.isPending ? 'Memproses...' : 'Ajukan'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className='h-40 w-full' />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dibayar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((p) => {
                  const m = PAYOUT_STATUS[p.status];
                  return (
                    <TableRow key={p.id}>
                      <TableCell>{formatDateTimeId(p.requestedAt)}</TableCell>
                      <TableCell>{formatRupiah(p.amount)}</TableCell>
                      <TableCell>
                        <Badge className={`${m.className} border-0`}>
                          {m.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {p.paidAt ? formatDateTimeId(p.paidAt) : '—'}
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
