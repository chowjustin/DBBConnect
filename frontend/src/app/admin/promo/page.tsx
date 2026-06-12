'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Sparkles } from 'lucide-react';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { TextField } from '@/components/form/text-field';
import { SelectField } from '@/components/form/select-field';
import { MultiToggleField } from '@/components/form/multi-toggle-field';
import { PAYMENT_KIND_OPTIONS, paymentKindLabel } from '@/constant/enums';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';
import { formatDateId, formatRupiah } from '@/lib/format';
import { usePagination } from '@/hooks/use-pagination';
import type { PaginatedApiResponse } from '@/types/api';
import type { PaymentKind } from '@/types/shared';

interface PromoForm {
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: string;
  validUntil: string;
  maxUses: string;
  applicableKinds: string[];
  minAmount: string;
}

interface PromoRow {
  id: string;
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  validUntil: string;
  maxUses: number;
  currentUses: number;
  applicableKinds: PaymentKind[];
  minAmount: number | null;
  active: boolean;
  createdAt: string;
}

const schema = z.object({
  code: z.string().min(3, 'Min 3 karakter').max(40),
  discountType: z.enum(['PERCENT', 'FIXED']),
  discountValue: z.string().refine((s) => Number(s) >= 1, 'Min 1'),
  validUntil: z.string().min(1, 'Pilih tanggal berakhir'),
  maxUses: z.string().refine((s) => Number(s) >= 1, 'Min 1'),
  applicableKinds: z.array(z.string()).min(1, 'Pilih minimal 1 jenis'),
  minAmount: z.string(),
}) satisfies z.ZodType<PromoForm>;

const DISCOUNT_TYPE_OPTS = [
  { value: 'PERCENT', label: 'Persentase (%)' },
  { value: 'FIXED', label: 'Nominal Tetap (Rp)' },
];

const DEFAULTS: PromoForm = {
  code: '',
  discountType: 'PERCENT',
  discountValue: '10',
  validUntil: '',
  maxUses: '100',
  applicableKinds: [],
  minAmount: '',
};

export default function AdminPromoPage() {
  const qc = useQueryClient();
  const { params } = usePagination();
  const [open, setOpen] = React.useState(false);
  const [disableTarget, setDisableTarget] = React.useState<PromoRow | null>(
    null,
  );

  const methods = useForm<PromoForm>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULTS,
  });

  const discountType = methods.watch('discountType');

  const { data, isLoading } = useQuery<{
    data: PromoRow[];
    meta: PaginatedApiResponse<PromoRow[]>['meta'];
  }>({
    queryKey: ['/admin/promo-codes', params],
    queryFn: async () => {
      const res = await api.get('/admin/promo-codes', { params });
      return res.data;
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const res = await api.patch(`/admin/promo-codes/${id}/active`, {
        active,
      });
      return res.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['/admin/promo-codes'] });
      notifySuccess(vars.active ? 'Kode diaktifkan' : 'Kode dinonaktifkan');
    },
    onError: (e) => notifyAxiosError(e),
  });

  const create = useMutation({
    mutationFn: async (values: PromoForm) => {
      const body = {
        code: values.code.trim().toUpperCase(),
        discountType: values.discountType,
        discountValue: Number(values.discountValue),
        validUntil: new Date(values.validUntil).toISOString(),
        maxUses: Number(values.maxUses),
        applicableKinds: values.applicableKinds,
        minAmount: values.minAmount ? Number(values.minAmount) : undefined,
      };
      const res = await api.post('/admin/promo-codes', body);
      return res.data;
    },
    onSuccess: () => {
      notifySuccess('Kode promo dibuat');
      qc.invalidateQueries({ queryKey: ['/admin/promo-codes'] });
      methods.reset(DEFAULTS);
      setOpen(false);
    },
    onError: (e) => notifyAxiosError(e, 'Gagal membuat kode promo'),
  });

  const onSubmit = methods.handleSubmit((values) => create.mutate(values));

  const empty = !isLoading && (data?.data.length ?? 0) === 0;

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={Sparkles}
        title='Kode Promo'
        description='Kelola kode diskon untuk sesi, langganan, atau featured.'
        actions={
          <Button size='sm' onClick={() => setOpen(true)}>
            <Plus className='size-3.5' /> Buat Kode
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton className='h-40 w-full' />
      ) : empty ? (
        <EmptyState
          icon={Sparkles}
          title='Belum ada kode promo'
          description='Buat kode pertama untuk memberi diskon ke siswa atau tutor.'
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className='size-3.5' /> Buat Kode
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Diskon</TableHead>
              <TableHead>Berlaku</TableHead>
              <TableHead>Pakai</TableHead>
              <TableHead>Min</TableHead>
              <TableHead>Berlaku untuk</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((p) => {
              const exhausted = p.currentUses >= p.maxUses;
              const expired = new Date(p.validUntil) < new Date();
              const usable = p.active && !exhausted && !expired;
              return (
                <TableRow key={p.id}>
                  <TableCell className='mono font-semibold'>{p.code}</TableCell>
                  <TableCell className='mono'>
                    {p.discountType === 'PERCENT'
                      ? `${p.discountValue}%`
                      : formatRupiah(p.discountValue)}
                  </TableCell>
                  <TableCell>{formatDateId(p.validUntil)}</TableCell>
                  <TableCell className='mono tabular-nums'>
                    {p.currentUses}/{p.maxUses}
                  </TableCell>
                  <TableCell className='mono'>
                    {p.minAmount ? formatRupiah(p.minAmount) : '—'}
                  </TableCell>
                  <TableCell>
                    <div className='flex flex-wrap gap-1'>
                      {p.applicableKinds.map((k) => (
                        <Badge
                          key={k}
                          variant='secondary'
                          className='border-primary-200 bg-primary-50 text-primary-800 border text-[10px]'
                        >
                          {paymentKindLabel(k)}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {!p.active ? (
                      <Badge
                        variant='secondary'
                        className='border border-rose-200 bg-rose-50 text-rose-700'
                      >
                        Nonaktif
                      </Badge>
                    ) : usable ? (
                      <Badge
                        variant='secondary'
                        className='border border-emerald-200 bg-emerald-50 text-emerald-700'
                      >
                        Aktif
                      </Badge>
                    ) : expired ? (
                      <Badge
                        variant='secondary'
                        className='border border-slate-200 bg-slate-50 text-slate-700'
                      >
                        Kedaluwarsa
                      </Badge>
                    ) : (
                      <Badge
                        variant='secondary'
                        className='border border-amber-200 bg-amber-50 text-amber-700'
                      >
                        Habis
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size='sm'
                      variant={p.active ? 'destructive' : 'default'}
                      disabled={toggleActive.isPending}
                      onClick={() => {
                        if (p.active) {
                          setDisableTarget(p);
                        } else {
                          toggleActive.mutate({ id: p.id, active: true });
                        }
                      }}
                    >
                      {p.active ? 'Nonaktifkan' : 'Aktifkan'}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <ConfirmDialog
        open={!!disableTarget}
        onOpenChange={(v) => !v && setDisableTarget(null)}
        tone='danger'
        title='Nonaktifkan kode promo?'
        description={
          disableTarget
            ? `Kode ${disableTarget.code} tidak dapat dipakai siswa hingga diaktifkan kembali.`
            : ''
        }
        confirmLabel='Nonaktifkan'
        loading={toggleActive.isPending}
        onConfirm={() => {
          if (!disableTarget) return;
          toggleActive.mutate(
            { id: disableTarget.id, active: false },
            { onSuccess: () => setDisableTarget(null) },
          );
        }}
      />

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) methods.reset(DEFAULTS);
        }}
      >
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Buat Kode Promo</DialogTitle>
            <DialogDescription>
              Kode otomatis di-uppercase saat disimpan.
            </DialogDescription>
          </DialogHeader>

          <FormProvider {...methods}>
            <form onSubmit={onSubmit} className='space-y-4'>
              <TextField<PromoForm>
                name='code'
                label='Kode'
                placeholder='WELCOME10'
              />

              <div className='grid gap-4 sm:grid-cols-2'>
                <SelectField<PromoForm>
                  name='discountType'
                  label='Tipe Diskon'
                  options={DISCOUNT_TYPE_OPTS}
                  className='w-full'
                />
                <TextField<PromoForm>
                  name='discountValue'
                  label={
                    discountType === 'PERCENT' ? 'Nilai (%)' : 'Nilai (Rp)'
                  }
                  type='number'
                  min={1}
                />
              </div>

              <div className='grid gap-4 sm:grid-cols-2'>
                <TextField<PromoForm>
                  name='validUntil'
                  label='Berlaku sampai'
                  type='date'
                />
                <TextField<PromoForm>
                  name='maxUses'
                  label='Maks. penggunaan'
                  type='number'
                  min={1}
                />
              </div>

              <MultiToggleField<PromoForm>
                name='applicableKinds'
                label='Berlaku untuk'
                options={PAYMENT_KIND_OPTIONS}
                helperText='Pilih jenis pembayaran yang dapat memakai kode ini.'
              />

              <TextField<PromoForm>
                name='minAmount'
                label='Minimum transaksi (Rp, opsional)'
                type='number'
                min={0}
                placeholder='100000'
                helperText='Kosongkan jika tidak ada minimum.'
              />

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setOpen(false)}
                  disabled={create.isPending}
                >
                  Batal
                </Button>
                <Button type='submit' disabled={create.isPending}>
                  {create.isPending ? 'Menyimpan...' : 'Buat Kode'}
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </div>
  );
}
