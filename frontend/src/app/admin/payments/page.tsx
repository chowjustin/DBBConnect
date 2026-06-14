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
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatDateTimeId, formatRupiah } from '@/lib/format';
import { paymentKindLabel } from '@/constant/enums';
import { resolveFileUrl } from '@/lib/file-url';
import { usePagination } from '@/hooks/use-pagination';
import type { PaginatedApiResponse } from '@/types/api';
import type { PaymentItem } from '@/app/student/payments/types';

import { useConfirmPayment, useRejectPayment } from './hooks/mutation';

export default function AdminPaymentsPage() {
  const { params } = usePagination();
  const [history, setHistory] = React.useState(false);
  const confirm = useConfirmPayment();
  const reject = useRejectPayment();
  const [confirmTarget, setConfirmTarget] = React.useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = React.useState<string | null>(null);

  const endpoint = history ? '/admin/payments/history' : '/admin/payments';
  const { data, isLoading } = useQuery<{
    data: PaymentItem[];
    meta: PaginatedApiResponse<PaymentItem[]>['meta'];
  }>({
    queryKey: [endpoint, params],
    queryFn: async () => {
      const res = await api.get(endpoint, { params });
      return res.data;
    },
  });

  const [lightboxSrc, setLightboxSrc] = React.useState<string | null>(null);

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={CreditCard}
        title={history ? 'Riwayat Pembayaran' : 'Antrian Pembayaran'}
        description={
          history
            ? 'Pembayaran yang sudah dikonfirmasi atau ditolak.'
            : 'Verifikasi bukti pembayaran dari siswa.'
        }
      />
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
              <TableHead>Jenis</TableHead>
              <TableHead>Nominal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bukti</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.length === 0 ? (
              <TableEmpty colSpan={6}>
                {history
                  ? 'Belum ada riwayat pembayaran.'
                  : 'Antrian pembayaran kosong.'}
              </TableEmpty>
            ) : (
              data?.data.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{formatDateTimeId(p.createdAt)}</TableCell>
                  <TableCell>{paymentKindLabel(p.kind)}</TableCell>
                  <TableCell className='mono'>
                    {formatRupiah(p.grossAmount)}
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
                          onClick={() => setConfirmTarget(p.id)}
                        >
                          Konfirmasi
                        </Button>
                        <Button
                          size='sm'
                          variant='destructive'
                          onClick={() => setRejectTarget(p.id)}
                        >
                          Tolak
                        </Button>
                      </div>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
      <ImageLightbox
        open={!!lightboxSrc}
        onClose={() => setLightboxSrc(null)}
        slides={lightboxSrc ? [{ src: lightboxSrc }] : []}
      />

      <ConfirmDialog
        open={!!confirmTarget}
        onOpenChange={(v) => !v && setConfirmTarget(null)}
        title='Konfirmasi pembayaran?'
        description='Saldo tutor akan dikredit dan langganan/featured akan aktif.'
        confirmLabel='Ya, konfirmasi'
        loading={confirm.isPending}
        onConfirm={() => {
          if (!confirmTarget) return;
          confirm.mutate(confirmTarget, {
            onSuccess: () => setConfirmTarget(null),
          });
        }}
      />

      <ConfirmDialog
        open={!!rejectTarget}
        onOpenChange={(v) => !v && setRejectTarget(null)}
        tone='danger'
        title='Tolak pembayaran?'
        description='Pengguna akan diberi tahu alasan penolakan.'
        confirmLabel='Tolak'
        noteLabel='Alasan penolakan'
        notePlaceholder='Misal: bukti tidak jelas, jumlah tidak sesuai...'
        noteRequired
        loading={reject.isPending}
        onConfirm={(note) => {
          if (!rejectTarget) return;
          reject.mutate(
            { id: rejectTarget, notes: note },
            { onSuccess: () => setRejectTarget(null) },
          );
        }}
      />
    </div>
  );
}
