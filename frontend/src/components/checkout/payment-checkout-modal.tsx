'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Banknote, Copy } from 'lucide-react';

import api from '@/lib/api';
import { withIdempotency } from '@/lib/idempotency';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { formatRupiah } from '@/lib/format';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';
import type { PaymentKind, PaymentMethod } from '@/types/shared';

interface PlatformBank {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  notes: string | null;
}

interface CheckoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: PaymentKind;
  /** Title shown at top of modal. */
  title: string;
  /** Sub-description, eg "Premium Siswa" or "7 hari featured". */
  description?: string;
  /**
   * Called when user clicks pay. Should create the intent on backend
   * (eg POST /subscription/request) and return the refId + price.
   * If the BE-derived price is known up-front pass `amount`.
   */
  createIntent: () => Promise<{ refId: string; amount: number }>;
  /** Optional fixed amount to display. createIntent's amount overrides. */
  amount?: number;
  /** Invalidation keys to refresh on success. */
  invalidate?: string[][];
}

export function PaymentCheckoutModal({
  open,
  onOpenChange,
  kind,
  title,
  description,
  createIntent,
  amount,
  invalidate = [],
}: CheckoutProps) {
  const qc = useQueryClient();
  const banksQ = useQuery<PlatformBank[]>({
    queryKey: ['/payment-instructions'],
    enabled: open,
  });
  const [proof, setProof] = React.useState<File | null>(null);
  const [promo, setPromo] = React.useState('');
  const [method, setMethod] = React.useState<PaymentMethod>('BANK_TRANSFER');

  const checkout = useMutation({
    mutationFn: async () => {
      if (!proof) throw new Error('Pilih bukti pembayaran');
      const intent = await createIntent();
      const fd = new FormData();
      fd.append('kind', kind);
      fd.append('refId', intent.refId);
      fd.append('method', method);
      if (promo) fd.append('promoCode', promo);
      fd.append('proofImage', proof);
      await api.post('/payments/upload-proof', fd, {
        ...withIdempotency(),
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return intent;
    },
    onSuccess: () => {
      notifySuccess('Pembayaran dikirim', 'Menunggu konfirmasi admin.');
      qc.invalidateQueries({ queryKey: ['/payments/mine'] });
      for (const key of invalidate) {
        qc.invalidateQueries({ queryKey: key });
      }
      onOpenChange(false);
      setProof(null);
      setPromo('');
    },
    onError: (e) => notifyAxiosError(e, 'Pembayaran gagal'),
  });

  const copy = (s: string) => {
    navigator.clipboard.writeText(s);
    notifySuccess('Disalin');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Banknote className='text-primary size-5' />
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        <div className='space-y-4'>
          {typeof amount === 'number' ? (
            <Card className='from-primary-50 to-primary-100 border-primary-200 bg-gradient-to-br'>
              <CardContent className='py-4'>
                <div className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>
                  Total Pembayaran
                </div>
                <div className='mono text-primary-900 text-2xl font-bold'>
                  {formatRupiah(amount)}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <div>
            <div className='mb-2 text-sm font-semibold'>
              Transfer ke salah satu rekening berikut
            </div>
            {banksQ.isLoading ? (
              <Skeleton className='h-20 w-full' />
            ) : (
              <div className='space-y-2'>
                {(banksQ.data ?? []).map((b) => (
                  <div
                    key={b.id}
                    className='border-primary-100 bg-primary-50/40 rounded-md border p-3 text-sm'
                  >
                    <div className='font-semibold'>{b.bankName}</div>
                    <div className='flex items-center justify-between gap-2'>
                      <span className='mono'>{b.accountNumber}</span>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon-xs'
                        aria-label='Salin nomor rekening'
                        onClick={() => copy(b.accountNumber)}
                      >
                        <Copy className='size-3' />
                      </Button>
                    </div>
                    <div className='text-muted-foreground text-xs'>
                      a.n. {b.accountHolder}
                    </div>
                    {b.notes ? (
                      <div className='text-muted-foreground mt-1 text-xs'>
                        {b.notes}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className='space-y-1.5'>
            <Label>Kode Promo (opsional)</Label>
            <Input
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              placeholder='WELCOME10'
            />
          </div>

          <div className='space-y-1.5'>
            <Label>Bukti Pembayaran</Label>
            <Input
              type='file'
              accept='.png,.jpg,.jpeg,.pdf'
              onChange={(e) => setProof(e.target.files?.[0] ?? null)}
            />
            <p className='text-muted-foreground text-xs'>
              Maks 5MB. PNG, JPG, atau PDF.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            onClick={() => checkout.mutate()}
            disabled={!proof || checkout.isPending}
          >
            {checkout.isPending ? 'Memproses...' : 'Kirim Pembayaran'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
