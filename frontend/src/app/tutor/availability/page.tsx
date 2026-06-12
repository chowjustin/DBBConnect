'use client';

import { useQuery } from '@tanstack/react-query';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';

import api from '@/lib/api';
import useAuthStore from '@/store/use-auth-store';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { SelectField } from '@/components/form/select-field';
import { TextField } from '@/components/form/text-field';
import { notifyError } from '@/lib/toast';
import { hhmmToMinutes, minutesToHHmm } from '@/lib/time';
import { TIMEZONE } from '@/constant/common';

import type { AvailabilitySlot, UpdateAvailabilityRequest } from './types';
import { useUpdateAvailability } from './hooks/mutation';

const DAYS = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
] as const;

const slotSchema = z.object({
  dayOfWeek: z.string(),
  start: z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:MM'),
  end: z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:MM'),
});
const schema = z.object({ slots: z.array(slotSchema) });
type AvailabilityForm = z.infer<typeof schema>;

const DAY_OPTS = DAYS.map((d, idx) => ({ value: String(idx), label: d }));

const DEFAULT_FORM: AvailabilityForm = {
  slots: [
    {
      dayOfWeek: '1',
      start: minutesToHHmm(9 * 60),
      end: minutesToHHmm(11 * 60),
    },
  ],
};

function slotsToForm(
  slots: AvailabilitySlot[] | undefined,
): AvailabilityForm | undefined {
  if (!slots) return undefined;
  if (slots.length === 0) return DEFAULT_FORM;
  return {
    slots: slots.map((s) => ({
      dayOfWeek: String(s.dayOfWeek),
      start: minutesToHHmm(s.startMin),
      end: minutesToHHmm(s.endMin),
    })),
  };
}

export default function AvailabilityPage() {
  const user = useAuthStore.useUser();
  const tutorProfileId = user?.tutorProfileId;
  const update = useUpdateAvailability();

  const existingQ = useQuery<AvailabilitySlot[]>({
    queryKey: [`/tutors/${tutorProfileId}/availability`],
    queryFn: async () => {
      const res = await api.get(`/tutors/${tutorProfileId}/availability`);
      return res.data;
    },
    enabled: !!tutorProfileId,
  });

  const methods = useForm<AvailabilityForm>({
    resolver: zodResolver(schema),
    values: slotsToForm(existingQ.data),
    resetOptions: { keepDirtyValues: true },
    defaultValues: DEFAULT_FORM,
  });

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'slots',
  });

  const onSubmit = methods.handleSubmit((values) => {
    for (const s of values.slots) {
      if (hhmmToMinutes(s.end) <= hhmmToMinutes(s.start)) {
        notifyError('Waktu selesai harus setelah waktu mulai');
        return;
      }
    }
    const req: UpdateAvailabilityRequest = {
      slots: values.slots.map((s) => ({
        dayOfWeek: Number(s.dayOfWeek),
        startMin: hhmmToMinutes(s.start),
        endMin: hhmmToMinutes(s.end),
        timezone: TIMEZONE,
      })),
    };
    update.mutate(req);
  });

  return (
    <div className='space-y-4'>
      <div>
        <h1 className='h2'>Ketersediaan</h1>
        <p className='text-muted-foreground text-sm'>
          Atur slot mingguan kapan Anda dapat menerima sesi.
        </p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={onSubmit} className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Slot Mingguan</CardTitle>
              <CardDescription>
                Zona waktu: <code>{TIMEZONE}</code>
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              {fields.map((field, i) => (
                <div
                  key={field.id}
                  className='grid grid-cols-[1fr_auto_auto_auto] items-end gap-2'
                >
                  <SelectField<AvailabilityForm>
                    name={`slots.${i}.dayOfWeek` as const}
                    label='Hari'
                    options={DAY_OPTS}
                  />
                  <TextField<AvailabilityForm>
                    name={`slots.${i}.start` as const}
                    label='Mulai'
                    type='time'
                  />
                  <TextField<AvailabilityForm>
                    name={`slots.${i}.end` as const}
                    label='Selesai'
                    type='time'
                  />
                  <div className='space-y-1'>
                    <Label className='opacity-0'>x</Label>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      aria-label='Hapus slot'
                      onClick={() => remove(i)}
                      className='text-rose-600 hover:bg-rose-50 hover:text-rose-700'
                    >
                      <Trash2 className='size-4' />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type='button'
                variant='outline'
                onClick={() =>
                  append({
                    dayOfWeek: '1',
                    start: minutesToHHmm(9 * 60),
                    end: minutesToHHmm(10 * 60),
                  })
                }
              >
                <Plus className='size-4' /> Tambah slot
              </Button>
            </CardContent>
          </Card>

          <Button type='submit' disabled={update.isPending}>
            {update.isPending ? 'Menyimpan...' : 'Simpan jadwal'}
          </Button>
        </form>
      </FormProvider>
    </div>
  );
}
