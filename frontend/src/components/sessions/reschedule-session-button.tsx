'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarClock } from 'lucide-react';
import { format } from 'date-fns';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';

interface Props {
  sessionId: string;
  startsAt: string;
  endsAt: string;
  status: string;
  invalidate?: Array<readonly unknown[]>;
  size?: 'sm' | 'default';
}

function toLocalParts(iso: string) {
  const d = new Date(iso);
  return {
    date: format(d, 'yyyy-MM-dd'),
    time: format(d, 'HH:mm'),
  };
}

export function RescheduleSessionButton({
  sessionId,
  startsAt,
  endsAt,
  status,
  invalidate = [],
  size = 'sm',
}: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const init = React.useMemo(
    () => ({
      start: toLocalParts(startsAt),
    }),
    [startsAt],
  );
  const durationMs = React.useMemo(
    () => new Date(endsAt).getTime() - new Date(startsAt).getTime(),
    [startsAt, endsAt],
  );
  const [date, setDate] = React.useState(init.start.date);
  const [startTime, setStartTime] = React.useState(init.start.time);

  React.useEffect(() => {
    if (open) {
      setDate(init.start.date);
      setStartTime(init.start.time);
    }
  }, [open, init]);

  const newStartDate = React.useMemo(() => {
    if (!date || !startTime) return null;
    const d = new Date(`${date}T${startTime}:00`);
    return isNaN(d.getTime()) ? null : d;
  }, [date, startTime]);
  const newEndDate = newStartDate
    ? new Date(newStartDate.getTime() + durationMs)
    : null;
  const durationHours = durationMs / 3_600_000;

  const submit = useMutation({
    mutationFn: async () => {
      if (!newStartDate || !newEndDate) {
        throw new Error('Tanggal/waktu tidak valid');
      }
      const res = await api.patch(`/sessions/${sessionId}/reschedule`, {
        startsAt: newStartDate.toISOString(),
        endsAt: newEndDate.toISOString(),
      });
      return res.data;
    },
    onSuccess: () => {
      notifySuccess('Sesi dijadwalkan ulang');
      qc.invalidateQueries({ queryKey: ['/sessions/student'] });
      qc.invalidateQueries({ queryKey: ['/sessions/tutor'] });
      for (const key of invalidate) {
        qc.invalidateQueries({ queryKey: key });
      }
      setOpen(false);
    },
    onError: (e) => notifyAxiosError(e),
  });

  const canReschedule =
    status === 'SCHEDULED' && new Date(startsAt).getTime() > Date.now();
  if (!canReschedule) return null;

  return (
    <>
      <Button
        size={size}
        variant='outline'
        onClick={() => setOpen(true)}
        className='border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100 hover:text-sky-900'
      >
        <CalendarClock className='size-3.5' />
        Jadwal Ulang
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Jadwal Ulang Sesi</DialogTitle>
            <DialogDescription>
              Durasi sesi dipertahankan ({durationHours} jam). Pilih tanggal dan
              waktu mulai baru.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-3'>
            <div className='space-y-1.5'>
              <Label htmlFor='reschedule-date'>Tanggal</Label>
              <Input
                id='reschedule-date'
                type='date'
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='reschedule-start'>Waktu Mulai</Label>
              <Input
                id='reschedule-start'
                type='time'
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            {newEndDate ? (
              <div className='border-primary-100 bg-primary-50/40 rounded-md border p-3 text-xs'>
                <div className='text-muted-foreground'>Selesai otomatis</div>
                <div className='mono font-semibold tabular-nums'>
                  {format(newEndDate, 'HH:mm')}
                </div>
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
              disabled={submit.isPending}
            >
              Batal
            </Button>
            <Button
              type='button'
              onClick={() => submit.mutate()}
              disabled={submit.isPending}
            >
              {submit.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
