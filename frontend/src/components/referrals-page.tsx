'use client';

import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDateId, formatRupiah } from '@/lib/format';
import { notifySuccess } from '@/lib/toast';

interface MyReferrals {
  code: string | null;
  rewards: Array<{
    id: string;
    creditAmount: number;
    status: string;
    createdAt: string;
  }>;
  totalGranted: number;
}

export function ReferralsPage() {
  const { data, isLoading } = useQuery<MyReferrals>({
    queryKey: ['/me/referrals'],
  });

  const copy = () => {
    if (!data?.code) return;
    navigator.clipboard.writeText(data.code);
    notifySuccess('Kode disalin');
  };

  return (
    <div className='space-y-4'>
      <h1 className='h2'>Referral</h1>

      <Card>
        <CardHeader>
          <CardTitle>Kode Anda</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          {isLoading ? (
            <Skeleton className='h-8 w-32' />
          ) : (
            <div className='flex items-center gap-3'>
              <code className='text-primary bg-primary-50 rounded-md px-3 py-1.5 font-mono text-lg font-bold'>
                {data?.code ?? '—'}
              </code>
              <Button variant='outline' size='sm' onClick={copy}>
                Salin
              </Button>
            </div>
          )}
          <p className='text-muted-foreground text-sm'>
            Total reward diterima:{' '}
            <span className='font-semibold'>
              {formatRupiah(data?.totalGranted ?? 0)}
            </span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Reward</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className='h-32 w-full' />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Nominal</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.rewards.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{formatDateId(r.createdAt)}</TableCell>
                    <TableCell>{formatRupiah(r.creditAmount)}</TableCell>
                    <TableCell>
                      <Badge variant='secondary'>{r.status}</Badge>
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
