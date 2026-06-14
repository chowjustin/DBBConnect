'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { CalendarDays, MapPin, Users } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  classFormatLabel,
  classModeLabel,
  educationLevelLabel,
  subjectLabels,
} from '@/constant/enums';
import { formatRupiah } from '@/lib/format';
import { CancelSessionButton } from '@/components/sessions/cancel-session-button';
import { RescheduleSessionButton } from '@/components/sessions/reschedule-session-button';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';

import type { SessionItem } from '@/app/student/sessions/types';

interface Props {
  session: SessionItem | null;
  onOpenChange: (v: boolean) => void;
}

function PaymentBadge({
  paid,
  status,
}: {
  paid: boolean;
  status?: 'UNDER_REVIEW' | 'CONFIRMED' | 'REJECTED' | 'REFUNDED' | null;
}) {
  if (paid || status === 'CONFIRMED') {
    return (
      <Badge
        variant='secondary'
        className='border border-emerald-200 bg-emerald-50 text-emerald-800'
      >
        Lunas
      </Badge>
    );
  }
  if (status === 'UNDER_REVIEW') {
    return (
      <Badge
        variant='secondary'
        className='border border-sky-200 bg-sky-50 text-sky-800'
      >
        Menunggu
      </Badge>
    );
  }
  if (status === 'REJECTED') {
    return (
      <Badge
        variant='secondary'
        className='border border-red-200 bg-red-50 text-red-800'
      >
        Ditolak
      </Badge>
    );
  }
  return (
    <Badge
      variant='secondary'
      className='border border-amber-200 bg-amber-50 text-amber-800'
    >
      Belum
    </Badge>
  );
}

export function SessionDetailDialog({ session, onOpenChange }: Props) {
  const open = !!session;
  const s = session;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Detail Sesi</DialogTitle>
          <DialogDescription>
            {s ? format(new Date(s.startsAt), 'EEEE, d MMM yyyy') : ''}
          </DialogDescription>
        </DialogHeader>

        {s ? (
          <div className='space-y-4 text-sm'>
            <div className='flex flex-wrap items-center gap-2'>
              <StatusBadge kind='session' status={s.status} />
              <Badge
                variant='secondary'
                className='border-primary-200 bg-primary-50 text-primary-800 border'
              >
                {classFormatLabel(s.format)}
              </Badge>
              <Badge
                variant='secondary'
                className='border-primary-200 bg-primary-50 text-primary-800 border'
              >
                {classModeLabel(s.mode)}
              </Badge>
            </div>

            <div className='space-y-2'>
              <Row
                icon={<CalendarDays className='size-4' />}
                label='Waktu'
                value={`${format(new Date(s.startsAt), 'HH:mm')} – ${format(new Date(s.endsAt), 'HH:mm')}`}
              />
              {s.location ? (
                <Row
                  icon={<MapPin className='size-4' />}
                  label='Lokasi'
                  value={s.location}
                />
              ) : null}
              <Row label='Harga/peserta' value={formatRupiah(s.pricePerSeat)} />
              {s.level ? (
                <Row label='Jenjang' value={educationLevelLabel(s.level)} />
              ) : null}
              {s.subjects && s.subjects.length ? (
                <Row
                  label='Mata pelajaran'
                  value={subjectLabels(s.subjects).join(', ')}
                />
              ) : null}
            </div>

            <div>
              <div className='text-muted-foreground mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide uppercase'>
                <Users className='size-3.5' />
                Peserta ({s.attendees?.length ?? 0})
              </div>
              <ul className='border-primary-100 divide-primary-100 divide-y rounded-md border'>
                {(s.attendees ?? []).length === 0 ? (
                  <li className='text-muted-foreground p-3 text-center text-xs'>
                    Belum ada peserta.
                  </li>
                ) : (
                  s.attendees!.map((a) => (
                    <li
                      key={a.id}
                      className='flex items-center justify-between gap-3 p-3'
                    >
                      <div className='min-w-0'>
                        <div className='truncate font-medium'>
                          {a.student?.user.name ?? '—'}
                        </div>
                        {a.student?.user.email ? (
                          <div className='text-muted-foreground truncate text-xs'>
                            {a.student.user.email}
                          </div>
                        ) : null}
                      </div>
                      <div className='flex items-center gap-2'>
                        <WhatsAppButton
                          phone={a.student?.whatsappNumber}
                          message={`Halo ${a.student?.user.name ?? 'siswa'}, terkait sesi tutoring kita.`}
                          size='icon-sm'
                        />
                        <PaymentBadge
                          paid={!!a.paymentId}
                          status={a.payment?.status}
                        />
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className='border-primary-100 flex flex-wrap justify-end gap-2 border-t pt-4'>
              <RescheduleSessionButton
                sessionId={s.id}
                startsAt={s.startsAt}
                endsAt={s.endsAt}
                status={s.status}
              />
              <CancelSessionButton
                sessionId={s.id}
                startsAt={s.startsAt}
                status={s.status}
                hasLivePayment={
                  !!s.attendees?.some(
                    (a) =>
                      a.payment?.status === 'UNDER_REVIEW' ||
                      a.payment?.status === 'CONFIRMED',
                  )
                }
              />
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className='flex items-center justify-between gap-3'>
      <span className='text-muted-foreground inline-flex items-center gap-1.5 text-xs'>
        {icon}
        {label}
      </span>
      <span className='font-medium'>{value}</span>
    </div>
  );
}
