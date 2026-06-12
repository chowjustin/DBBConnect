'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Banknote, Check, Copy, X } from 'lucide-react';

import api from '@/lib/api';
import { withIdempotency } from '@/lib/idempotency';
import { uploadFile } from '@/lib/upload';
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
import { DropzoneField } from '@/components/form/dropzone-field';
import { formatRupiah } from '@/lib/format';
import { notifyAxiosError, notifyError, notifySuccess } from '@/lib/toast';
import type { PaymentKind, PaymentMethod } from '@/types/shared';

interface PlatformBank {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  notes: string | null;
}

interface PreviewResponse {
  gross: number;
  discount: number;
  net: number;
}

interface CheckoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: PaymentKind;
  title: string;
  description?: string;
  /** refId used for promo preview (attendeeId / tier / days-as-string). */
  previewRefId?: string;
  createIntent: () => Promise<{ refId: string; amount: number }>;
  amount?: number;
  invalidate?: string[][];
}

interface CheckoutForm {
  promo: string;
  proof: File | null;
}

const schema = z.object({
  promo: z.string(),
  proof: z.any().refine((v) => v instanceof File, 'Pilih bukti pembayaran'),
}) satisfies z.ZodType<CheckoutForm>;

export function PaymentCheckoutModal({
  open,
  onOpenChange,
  kind,
  title,
  description,
  previewRefId,
  createIntent,
  amount,
  invalidate = [],
}: CheckoutProps) {
  const qc = useQueryClient();
  const banksQ = useQuery<PlatformBank[]>({
    queryKey: ['/payment-instructions'],
    enabled: open,
  });

  const method: PaymentMethod = 'BANK_TRANSFER';

  const methods = useForm<CheckoutForm>({
    resolver: zodResolver(schema),
    defaultValues: { promo: '', proof: null },
  });

  const [applied, setApplied] = React.useState<{
    code: string;
    discount: number;
    net: number;
  } | null>(null);

  React.useEffect(() => {
    if (!open) {
      setApplied(null);
      methods.reset({ promo: '', proof: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const previewMut = useMutation({
    mutationFn: async (code: string) => {
      if (!previewRefId) {
        throw new Error('Promo tidak tersedia untuk transaksi ini.');
      }
      const res = await api.post<PreviewResponse>(
        '/payments/preview-discount',
        {
          kind,
          refId: previewRefId,
          code: code.trim().toUpperCase(),
        },
      );
      return res.data;
    },
    onSuccess: (data, code) => {
      setApplied({
        code: code.trim().toUpperCase(),
        discount: data.discount,
        net: data.net,
      });
      notifySuccess(
        'Promo diterapkan',
        `Hemat ${formatRupiah(data.discount)}.`,
      );
    },
    onError: (e) => notifyAxiosError(e, 'Kode promo tidak valid'),
  });

  const onApplyPromo = () => {
    const code = methods.getValues('promo');
    if (!code.trim()) {
      notifyError('Isi kode promo dulu');
      return;
    }
    previewMut.mutate(code);
  };

  const onRemovePromo = () => {
    setApplied(null);
    methods.setValue('promo', '');
  };

  const checkout = useMutation({
    mutationFn: async (values: CheckoutForm) => {
      if (!values.proof) throw new Error('Pilih bukti pembayaran');
      const uploaded = await uploadFile(values.proof, 'payment');
      const intent = await createIntent();
      await api.post(
        '/payments/upload-proof',
        {
          kind,
          refId: intent.refId,
          method,
          promoCode: applied?.code,
          proofUrl: uploaded.file_url,
        },
        withIdempotency(),
      );
      return intent;
    },
    onSuccess: () => {
      notifySuccess('Pembayaran dikirim', 'Menunggu konfirmasi admin.');
      qc.invalidateQueries({ queryKey: ['/payments/mine'] });
      for (const key of invalidate) {
        qc.invalidateQueries({ queryKey: key });
      }
      onOpenChange(false);
    },
    onError: (e) => notifyAxiosError(e, 'Pembayaran gagal'),
  });

  const onSubmit = methods.handleSubmit((values) => checkout.mutate(values));

  const copy = (s: string) => {
    navigator.clipboard.writeText(s);
    notifySuccess('Disalin');
  };

  const baseAmount = typeof amount === 'number' ? amount : null;
  const totalAmount = applied?.net ?? baseAmount;

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

        <FormProvider {...methods}>
          <form onSubmit={onSubmit} className='space-y-4'>
            {totalAmount !== null ? (
              <Card className='from-primary-50 to-primary-100 border-primary-200 bg-gradient-to-br'>
                <CardContent className='py-4'>
                  <div className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>
                    Total Pembayaran
                  </div>
                  <div className='mono text-primary-900 text-2xl font-bold'>
                    {formatRupiah(totalAmount)}
                  </div>
                  {applied && baseAmount !== null ? (
                    <div className='text-muted-foreground mt-1 flex items-center gap-2 text-xs'>
                      <span className='line-through'>
                        {formatRupiah(baseAmount)}
                      </span>
                      <span className='text-emerald-700'>
                        −{formatRupiah(applied.discount)} ({applied.code})
                      </span>
                    </div>
                  ) : null}
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
              {applied ? (
                <div className='border-primary-200 bg-primary-50/40 flex items-center justify-between gap-2 rounded-md border p-3 text-sm'>
                  <div className='flex items-center gap-2'>
                    <Check className='size-4 text-emerald-600' />
                    <span className='mono font-semibold'>{applied.code}</span>
                    <span className='text-muted-foreground text-xs'>
                      Hemat {formatRupiah(applied.discount)}
                    </span>
                  </div>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon-sm'
                    aria-label='Hapus promo'
                    onClick={onRemovePromo}
                  >
                    <X className='size-4' />
                  </Button>
                </div>
              ) : (
                <Controller
                  control={methods.control}
                  name='promo'
                  render={({ field }) => (
                    <div className='flex gap-2'>
                      <Input
                        {...field}
                        placeholder='WELCOME10'
                        className='mono uppercase'
                        disabled={!previewRefId || previewMut.isPending}
                      />
                      <Button
                        type='button'
                        variant='secondary'
                        onClick={onApplyPromo}
                        disabled={!previewRefId || previewMut.isPending}
                      >
                        {previewMut.isPending ? 'Memeriksa...' : 'Terapkan'}
                      </Button>
                    </div>
                  )}
                />
              )}
              {!previewRefId ? (
                <p className='text-muted-foreground text-xs'>
                  Promo tidak tersedia untuk transaksi ini.
                </p>
              ) : null}
            </div>

            <DropzoneField<CheckoutForm>
              name='proof'
              label='Bukti Pembayaran'
              accept='.png,.jpg,.jpeg,.pdf'
              maxSizeMB={5}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type='submit' disabled={checkout.isPending}>
                {checkout.isPending ? 'Memproses...' : 'Kirim Pembayaran'}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
