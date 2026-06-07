'use client';

import { useQuery } from '@tanstack/react-query';

import api from '@/lib/api';
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
import { formatDateTimeId, formatRupiah } from '@/lib/format';

interface WalletResponse {
  wallet: {
    availableBalance: number;
    lifetimeEarned: number;
  };
  ledger: Array<{
    id: string;
    delta: number;
    reason: string;
    createdAt: string;
  }>;
}

export default function WalletPage() {
  const { data, isLoading } = useQuery<WalletResponse>({
    queryKey: ['/tutor/wallet'],
  });

  return (
    <div className='space-y-4'>
      <h1 className='h2'>Dompet</h1>
      <div className='grid gap-4 sm:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Saldo Tersedia</CardTitle>
          </CardHeader>
          <CardContent className='h1 text-primary'>
            {isLoading ? '—' : formatRupiah(data?.wallet.availableBalance ?? 0)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Pendapatan</CardTitle>
          </CardHeader>
          <CardContent className='h2 text-muted-foreground'>
            {isLoading ? '—' : formatRupiah(data?.wallet.lifetimeEarned ?? 0)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className='h-40 w-full' />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Alasan</TableHead>
                  <TableHead className='text-right'>Delta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.ledger.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{formatDateTimeId(l.createdAt)}</TableCell>
                    <TableCell>{l.reason}</TableCell>
                    <TableCell
                      className={`text-right font-mono ${l.delta >= 0 ? 'text-emerald-700' : 'text-destructive'}`}
                    >
                      {l.delta >= 0 ? '+' : ''}
                      {formatRupiah(l.delta)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
