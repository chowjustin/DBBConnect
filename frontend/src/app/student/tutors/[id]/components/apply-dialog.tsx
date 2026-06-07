'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { notifyError } from '@/lib/toast';

import { useApply } from '../hooks/mutation';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tutorId: string;
  tutorName?: string;
}

export function ApplyDialog({ open, onOpenChange, tutorId, tutorName }: Props) {
  const [message, setMessage] = React.useState('');
  const apply = useApply();

  const onSubmit = () => {
    if (message.length > 500) {
      notifyError('Pesan maks 500 karakter');
      return;
    }
    apply.mutate(
      { tutorId, message: message || undefined },
      {
        onSuccess: () => {
          onOpenChange(false);
          setMessage('');
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajukan Belajar</DialogTitle>
          <DialogDescription>
            {tutorName
              ? `Kirim pesan singkat ke ${tutorName}.`
              : 'Kirim pesan singkat ke tutor.'}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-2'>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder='Jelaskan kebutuhan belajar Anda...'
          />
          <div className='text-muted-foreground text-right text-xs'>
            {message.length}/500
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={onSubmit} disabled={apply.isPending}>
            {apply.isPending ? 'Mengirim...' : 'Kirim Aplikasi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
