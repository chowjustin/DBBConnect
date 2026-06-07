'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { notifyAxiosError, notifySuccess } from '@/lib/toast';
import type { PaginatedApiResponse } from '@/types/api';
import type { PayoutStatus } from '@/types/shared';

interface PayoutRow {
  id: string;
  amount: number;
  status: PayoutStatus;
  bankName: string;
  bankAccount: string;
  accountHolder: string;
  requestedAt: string;
  tutor?: { user: { name: string; email: string } };
}

export default function AdminPayoutsPage() {
  const qc = useQueryClient();
  const { params } = usePagination();

  const { data, isLoading } = useQuery<{
    data: PayoutRow[];
    meta: PaginatedApiResponse<PayoutRow[]>['meta'];
  }>({
    queryKey: ['/admin/payouts', params],
    queryFn: async () => {
      const res = await api.get('/admin/payouts', { params });
      return res.data;
    },
  });

  const markPaid = useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const fd = new FormData();
      fd.append('proofImage', file);
      const res = await api.post(`/admin/payouts/${id}/mark-paid`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/admin/payouts'] });
      notifySuccess('Ditandai sebagai dibayar');
    },
    onError: (e) => notifyAxiosError(e),
  });

  const pickFile = (id: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.onchange = () => {
      const f = input.files?.[0];
      if (f) markPaid.mutate({ id, file: f });
    };
    input.click();
  };

  return (
    <div className='space-y-4'>
      <h1 className='h2'>Antrian Pencairan</h1>
      {isLoading ? (
        <Skeleton className='h-40 w-full' />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Tutor</TableHead>
              <TableHead>Rekening</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((p) => {
              const m = PAYOUT_STATUS[p.status];
              return (
                <TableRow key={p.id}>
                  <TableCell>{formatDateTimeId(p.requestedAt)}</TableCell>
                  <TableCell>
                    <div>{p.tutor?.user.name ?? '—'}</div>
                    <div className='text-muted-foreground text-xs'>
                      {p.tutor?.user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{p.bankName}</div>
                    <div className='text-muted-foreground text-xs'>
                      {p.bankAccount} a.n. {p.accountHolder}
                    </div>
                  </TableCell>
                  <TableCell>{formatRupiah(p.amount)}</TableCell>
                  <TableCell>
                    <Badge className={`${m.className} border-0`}>{m.label}</Badge>
                  </TableCell>
                  <TableCell>
                    {p.status === 'REQUESTED' ? (
                      <Button
                        size='sm'
                        onClick={() => pickFile(p.id)}
                        disabled={markPaid.isPending}
                      >
                        Tandai Dibayar
                      </Button>
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
