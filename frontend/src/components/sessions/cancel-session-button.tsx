'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ban } from 'lucide-react';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';

interface Props {
  sessionId: string;
  startsAt: string;
  status: string;
  /** Set true if any attendee has a live (under-review or confirmed) payment. Hides cancel. */
  hasLivePayment?: boolean;
  /** Keys to invalidate after cancel succeeds. */
  invalidate?: Array<readonly unknown[]>;
  size?: 'sm' | 'default';
}

export function CancelSessionButton({
  sessionId,
  startsAt,
  status,
  hasLivePayment = false,
  invalidate = [],
  size = 'sm',
}: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const cancel = useMutation({
    mutationFn: async (reason?: string) => {
      const res = await api.patch(`/sessions/${sessionId}/cancel`, {
        reason: reason || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      notifySuccess('Sesi dibatalkan');
      qc.invalidateQueries({ queryKey: ['/sessions/student'] });
      qc.invalidateQueries({ queryKey: ['/sessions/tutor'] });
      for (const key of invalidate) {
        qc.invalidateQueries({ queryKey: key });
      }
      setOpen(false);
    },
    onError: (e) => notifyAxiosError(e),
  });

  const canCancel =
    status === 'SCHEDULED' &&
    new Date(startsAt).getTime() > Date.now() &&
    !hasLivePayment;
  if (!canCancel) return null;

  return (
    <>
      <Button
        size={size}
        variant='outline'
        onClick={() => setOpen(true)}
        className='border-red-300 bg-red-50 text-red-800 hover:bg-red-100 hover:text-red-900'
      >
        <Ban className='size-3.5' />
        Batalkan
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title='Batalkan Sesi'
        description='Sesi akan dibatalkan. Hanya sesi yang belum dibayar yang bisa dibatalkan — untuk sesi berbayar gunakan jadwal ulang.'
        confirmLabel='Batalkan Sesi'
        cancelLabel='Tidak'
        tone='danger'
        loading={cancel.isPending}
        noteLabel='Alasan (opsional)'
        notePlaceholder='Misal: bentrok jadwal, sakit, dll.'
        onConfirm={(reason) => cancel.mutate(reason)}
      />
    </>
  );
}
