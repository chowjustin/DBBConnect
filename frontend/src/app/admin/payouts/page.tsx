'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PiggyBank } from 'lucide-react';

import api from '@/lib/api';
import { uploadFile } from '@/lib/upload';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Dropzone } from '@/components/form/dropzone-field';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDateTimeId, formatRupiah } from '@/lib/format';
import { usePagination } from '@/hooks/use-pagination';
import { notifyAxiosError, notifyError, notifySuccess } from '@/lib/toast';
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
  const [history, setHistory] = React.useState(false);
  const [target, setTarget] = React.useState<PayoutRow | null>(null);
  const [proof, setProof] = React.useState<File | null>(null);

  React.useEffect(() => {
    if (!target) setProof(null);
  }, [target]);

  const endpoint = history ? '/admin/payouts/history' : '/admin/payouts';
  const { data, isLoading } = useQuery<{
    data: PayoutRow[];
    meta: PaginatedApiResponse<PayoutRow[]>['meta'];
  }>({
    queryKey: [endpoint, params],
    queryFn: async () => {
      const res = await api.get(endpoint, { params });
      return res.data;
    },
  });

  const markPaid = useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const uploaded = await uploadFile(file, 'payout');
      const res = await api.post(`/admin/payouts/${id}/mark-paid`, {
        proofUrl: uploaded.file_url,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/admin/payouts'] });
      qc.invalidateQueries({ queryKey: ['/admin/payouts/history'] });
      notifySuccess('Ditandai sebagai dibayar');
      setTarget(null);
    },
    onError: (e) => notifyAxiosError(e),
  });

  const onConfirm = () => {
    if (!target) return;
    if (!proof) {
      notifyError('Unggah bukti transfer dulu');
      return;
    }
    markPaid.mutate({ id: target.id, file: proof });
  };

  return (
    <div className='space-y-4'>
      <h1 className='h2'>
        {history ? 'Riwayat Pencairan' : 'Antrian Pencairan'}
      </h1>
      <Tabs
        value={history ? 'history' : 'queue'}
        onValueChange={(v) => setHistory(v === 'history')}
      >
        <TabsList>
          <TabsTrigger value='queue'>Antrian</TabsTrigger>
          <TabsTrigger value='history'>Riwayat</TabsTrigger>
        </TabsList>
      </Tabs>
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
            {data?.data.length === 0 ? (
              <TableEmpty colSpan={6}>
                {history
                  ? 'Belum ada riwayat pencairan.'
                  : 'Antrian pencairan kosong.'}
              </TableEmpty>
            ) : (
              data?.data.map((p) => (
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
                  <TableCell className='mono'>
                    {formatRupiah(p.amount)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge kind='payout' status={p.status} />
                  </TableCell>
                  <TableCell>
                    {p.status === 'REQUESTED' ? (
                      <Button size='sm' onClick={() => setTarget(p)}>
                        Tandai Dibayar
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      <Dialog
        open={!!target}
        onOpenChange={(v) => {
          if (!v) setTarget(null);
        }}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <div className='flex items-start gap-3'>
              <div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600'>
                <PiggyBank className='size-5' />
              </div>
              <div className='space-y-1'>
                <DialogTitle>Tandai pencairan dibayar?</DialogTitle>
                <DialogDescription>
                  Saldo tutor akan dikurangi dan status berubah jadi Dibayar.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {target ? (
            <div className='border-primary-100 bg-primary-50/40 space-y-2 rounded-md border p-3 text-sm'>
              <Row label='Tutor' value={target.tutor?.user.name ?? '—'} />
              <Row label='Bank' value={target.bankName} />
              <Row
                label='Rekening'
                value={`${target.bankAccount} a.n. ${target.accountHolder}`}
              />
              <Row label='Jumlah' value={formatRupiah(target.amount)} mono />
            </div>
          ) : null}

          <div className='space-y-1.5'>
            <Label>Bukti Transfer</Label>
            <Dropzone
              value={proof}
              onChange={setProof}
              accept='.png,.jpg,.jpeg,.pdf'
              maxSizeMB={5}
            />
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setTarget(null)}
              disabled={markPaid.isPending}
            >
              Batal
            </Button>
            <Button
              type='button'
              onClick={onConfirm}
              disabled={!proof || markPaid.isPending}
            >
              {markPaid.isPending ? 'Memproses...' : 'Tandai Dibayar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className='flex items-center justify-between gap-3'>
      <span className='text-muted-foreground text-xs'>{label}</span>
      <span className={`font-medium ${mono ? 'mono tabular-nums' : ''}`}>
        {value}
      </span>
    </div>
  );
}
