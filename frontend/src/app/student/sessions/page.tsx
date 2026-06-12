'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import api from '@/lib/api';
import useAuthStore from '@/store/use-auth-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PaymentCheckoutModal } from '@/components/checkout/payment-checkout-modal';
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
import { formatDateTimeId, formatRupiah } from '@/lib/format';
import { classFormatLabel } from '@/constant/enums';
import { usePagination } from '@/hooks/use-pagination';
import { apiUrl } from '@/constant/env';
import { getToken } from '@/lib/cookie';
import type { PaginatedApiResponse } from '@/types/api';

import { CalendarDays, Star, Wallet } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { ReviewDialog } from './components/review-dialog';

import type { SessionItem } from './types';

export default function StudentSessionsPage() {
  const { params } = usePagination();
  const [past, setPast] = React.useState(false);
  const user = useAuthStore.useUser();
  const studentProfileId = user?.studentProfileId;

  const { data, isLoading } = useQuery<{
    data: SessionItem[];
    meta: PaginatedApiResponse<SessionItem[]>['meta'];
  }>({
    queryKey: ['/sessions/student', { ...params, past }],
    queryFn: async () => {
      const res = await api.get('/sessions/student', {
        params: { ...params, past },
      });
      return res.data;
    },
  });

  const downloadIcal = async (id: string) => {
    const token = getToken();
    const res = await fetch(`${apiUrl}/api/sessions/${id}/ical`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const text = await res.text();
    const blob = new Blob([text], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${id}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [reviewTarget, setReviewTarget] = React.useState<{
    tutorId: string;
    tutorName?: string;
  } | null>(null);
  const [payTarget, setPayTarget] = React.useState<{
    attendeeId: string;
    amount: number;
    tutorName?: string;
  } | null>(null);

  const empty = !isLoading && (data?.data.length ?? 0) === 0;

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={CalendarDays}
        title='Sesi Saya'
        description={past ? 'Riwayat sesi belajar.' : 'Sesi mendatang.'}
      />
      <Tabs
        value={past ? 'past' : 'upcoming'}
        onValueChange={(v) => setPast(v === 'past')}
      >
        <TabsList>
          <TabsTrigger value='upcoming'>Mendatang</TabsTrigger>
          <TabsTrigger value='past'>Riwayat</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <Skeleton className='h-40 w-full' />
      ) : empty ? (
        <EmptyState
          icon={CalendarDays}
          title={past ? 'Belum ada riwayat sesi' : 'Belum ada sesi terjadwal'}
          description={
            past
              ? 'Sesi yang sudah selesai akan tampil di sini.'
              : 'Pesan sesi dari tutor yang sudah menerima aplikasi Anda.'
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tutor</TableHead>
              <TableHead>Mulai</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((s) => {
              const myAttendee = s.attendees?.find(
                (a) => a.studentId === studentProfileId,
              );
              const paymentStatus = myAttendee?.payment?.status;
              const canPay =
                !!myAttendee &&
                !myAttendee.paymentId &&
                (!paymentStatus || paymentStatus === 'REJECTED');
              return (
                <TableRow key={s.id}>
                  <TableCell>{s.tutor?.user.name ?? '—'}</TableCell>
                  <TableCell>{formatDateTimeId(s.startsAt)}</TableCell>
                  <TableCell>{classFormatLabel(s.format)}</TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <StatusBadge kind='session' status={s.status} />
                      {myAttendee ? (
                        <PaymentBadge
                          paymentStatus={paymentStatus}
                          paid={!!myAttendee.paymentId}
                        />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className='mono'>
                    {formatRupiah(s.pricePerSeat)}
                  </TableCell>
                  <TableCell>
                    <div className='flex gap-2'>
                      {canPay && myAttendee ? (
                        <Button
                          size='sm'
                          onClick={() =>
                            setPayTarget({
                              attendeeId: myAttendee.id,
                              amount: s.pricePerSeat,
                              tutorName: s.tutor?.user.name,
                            })
                          }
                        >
                          <Wallet className='size-3.5' />{' '}
                          {paymentStatus === 'REJECTED'
                            ? 'Bayar Ulang'
                            : 'Bayar'}
                        </Button>
                      ) : null}
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => downloadIcal(s.id)}
                      >
                        iCal
                      </Button>
                      {s.status === 'COMPLETED' ? (
                        <Button
                          size='sm'
                          variant='secondary'
                          onClick={() =>
                            setReviewTarget({
                              tutorId: s.tutorId,
                              tutorName: s.tutor?.user.name,
                            })
                          }
                        >
                          <Star className='size-3.5' /> Ulasan
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <ReviewDialog
        open={!!reviewTarget}
        onOpenChange={(v) => !v && setReviewTarget(null)}
        tutorId={reviewTarget?.tutorId ?? ''}
        tutorName={reviewTarget?.tutorName}
      />

      <PaymentCheckoutModal
        open={!!payTarget}
        onOpenChange={(v) => !v && setPayTarget(null)}
        kind='SESSION'
        title='Bayar Sesi'
        description={
          payTarget?.tutorName
            ? `Sesi dengan ${payTarget.tutorName}`
            : undefined
        }
        amount={payTarget?.amount}
        previewRefId={payTarget?.attendeeId}
        invalidate={[['/sessions/student']]}
        createIntent={async () => ({
          refId: payTarget?.attendeeId ?? '',
          amount: payTarget?.amount ?? 0,
        })}
      />
    </div>
  );
}

function PaymentBadge({
  paymentStatus,
  paid,
}: {
  paymentStatus?: 'UNDER_REVIEW' | 'CONFIRMED' | 'REJECTED' | 'REFUNDED';
  paid: boolean;
}) {
  if (paid || paymentStatus === 'CONFIRMED') {
    return (
      <Badge
        variant='secondary'
        className='border border-emerald-200 bg-emerald-50 text-emerald-700'
      >
        Lunas
      </Badge>
    );
  }
  if (paymentStatus === 'UNDER_REVIEW') {
    return (
      <Badge
        variant='secondary'
        className='border-primary-200 bg-primary-50 text-primary-800 border'
      >
        Menunggu Konfirmasi
      </Badge>
    );
  }
  if (paymentStatus === 'REJECTED') {
    return (
      <Badge
        variant='secondary'
        className='border border-rose-200 bg-rose-50 text-rose-700'
      >
        Pembayaran Ditolak
      </Badge>
    );
  }
  if (paymentStatus === 'REFUNDED') {
    return (
      <Badge
        variant='secondary'
        className='border border-slate-200 bg-slate-50 text-slate-700'
      >
        Refund
      </Badge>
    );
  }
  return (
    <Badge
      variant='secondary'
      className='border border-amber-200 bg-amber-50 text-amber-700'
    >
      Belum Bayar
    </Badge>
  );
}
