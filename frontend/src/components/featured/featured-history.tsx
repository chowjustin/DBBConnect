'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRupiah } from '@/lib/format';

interface PaymentRow {
  id: string;
  status: 'UNDER_REVIEW' | 'CONFIRMED' | 'REJECTED' | 'REFUNDED';
  netAmount: number;
  grossAmount: number;
  createdAt: string;
  notes: string | null;
}

export function FeaturedHistory() {
  const q = useQuery<PaymentRow[]>({ queryKey: ['/featured/history'] });

  if (q.isLoading) return <Skeleton className='h-32 w-full' />;
  const rows = q.data ?? [];

  return (
    <div>
      <div className='mb-3 flex items-center justify-between'>
        <h3 className='text-foreground text-base font-semibold'>
          Riwayat featured
        </h3>
        <span className='text-muted-foreground text-xs'>
          {rows.length} transaksi
        </span>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Nominal</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Catatan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableEmpty colSpan={4}>Belum ada riwayat featured.</TableEmpty>
          ) : (
            rows.map((p) => (
              <TableRow key={p.id}>
                <TableCell className='mono text-xs tabular-nums'>
                  {format(new Date(p.createdAt), 'd MMM yyyy, HH:mm', {
                    locale: id,
                  })}
                </TableCell>
                <TableCell className='mono tabular-nums'>
                  {formatRupiah(p.grossAmount)}
                </TableCell>
                <TableCell>
                  <StatusBadge kind='payment' status={p.status} />
                </TableCell>
                <TableCell className='text-muted-foreground max-w-xs truncate text-xs'>
                  {p.notes ?? '—'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
