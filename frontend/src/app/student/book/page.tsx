'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarPlus } from 'lucide-react';

import api from '@/lib/api';
import { withIdempotency } from '@/lib/idempotency';
import useAuthStore from '@/store/use-auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { Stepper } from '@/components/ui/stepper';
import { EmptyState } from '@/components/ui/empty-state';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TextField } from '@/components/form/text-field';
import { SelectField } from '@/components/form/select-field';
import { notifyAxiosError, notifyError, notifySuccess } from '@/lib/toast';
import { formatRupiah } from '@/lib/format';
import { hhmmToMinutes, minutesToHHmm } from '@/lib/time';
import {
  CLASS_FORMAT_OPTIONS,
  CLASS_MODE_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  SUBJECT_OPTIONS,
  classFormatLabel,
  classModeLabel,
  educationLevelLabel,
  subjectLabels,
} from '@/constant/enums';
import { MultiToggleField } from '@/components/form/multi-toggle-field';
import type {
  ClassFormat,
  ClassMode,
  EducationLevel,
  Subject,
} from '@/types/shared';

interface ApplicationItem {
  id: string;
  status: string;
  tutorId: string;
  tutor: {
    id: string;
    hourlyRate: number | null;
    user: { id: string; name: string; email: string };
  };
}

interface AvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startMin: number;
  endMin: number;
  timezone: string;
}

const DAYS = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
] as const;

interface BookForm {
  tutorId: string;
  date: string;
  startTime: string;
  endTime: string;
  format: ClassFormat;
  mode: ClassMode;
  subjects: Subject[];
  level: EducationLevel;
}

const schema = z
  .object({
    tutorId: z.string().min(1, 'Pilih tutor'),
    date: z.string().min(1, 'Pilih tanggal'),
    startTime: z.string().min(1, 'Pilih waktu mulai'),
    endTime: z.string().min(1, 'Pilih waktu selesai'),
    format: z.enum(['PRIVATE_1', 'SEMI_PRIVATE', 'GROUP']),
    mode: z.enum(['ONLINE', 'OFFLINE']),
    subjects: z
      .array(
        z.enum([
          'MATH',
          'PHYSICS',
          'CHEMISTRY',
          'ENGLISH',
          'COMPUTER_SCIENCE',
          'ECONOMICS',
          'ACCOUNTING',
        ]),
      )
      .min(1, 'Pilih minimal 1 mata pelajaran'),
    level: z.enum(['JUNIOR_HIGH', 'SENIOR_HIGH', 'UNIVERSITY']),
  })
  .refine((d) => d.startTime < d.endTime, {
    path: ['endTime'],
    message: 'Waktu selesai harus setelah waktu mulai',
  }) satisfies z.ZodType<BookForm>;

export default function BookSessionPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const qc = useQueryClient();
  const user = useAuthStore.useUser();
  const studentProfileId = user?.studentProfileId;

  const [step, setStep] = React.useState(0);

  const methods = useForm<BookForm>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      tutorId: sp.get('tutor') ?? '',
      date: '',
      startTime: '',
      endTime: '',
      format: 'PRIVATE_1',
      mode: 'ONLINE',
      subjects: [],
      level: 'SENIOR_HIGH',
    },
  });

  const values = methods.watch();

  const apps = useQuery<{ data: ApplicationItem[] }>({
    queryKey: ['/applications/student', { per_page: 50 }],
    queryFn: async () => {
      const res = await api.get('/applications/student', {
        params: { per_page: 50, status: 'ACCEPTED' },
      });
      return res.data;
    },
  });

  const acceptedTutors =
    apps.data?.data
      .map((a) => a.tutor)
      .filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i) ?? [];

  const selectedTutor = acceptedTutors.find((t) => t.id === values.tutorId);

  const avail = useQuery<AvailabilitySlot[]>({
    queryKey: [`/tutors/${values.tutorId}/availability`],
    enabled: !!values.tutorId,
  });

  const book = useMutation({
    mutationFn: async (v: BookForm) => {
      if (!studentProfileId) throw new Error('No student profile');
      if (!selectedTutor) throw new Error('Pilih tutor');
      const startsAt = new Date(`${v.date}T${v.startTime}:00`).toISOString();
      const endsAt = new Date(`${v.date}T${v.endTime}:00`).toISOString();
      const res = await api.post(
        '/sessions',
        {
          tutorId: v.tutorId,
          format: v.format,
          mode: v.mode,
          subjects: v.subjects,
          level: v.level,
          startsAt,
          endsAt,
          attendeeStudentIds: [studentProfileId],
        },
        withIdempotency(),
      );
      return res.data;
    },
    onSuccess: () => {
      notifySuccess('Sesi berhasil dipesan');
      qc.invalidateQueries({ queryKey: ['/sessions/student'] });
      router.push('/student/sessions');
    },
    onError: (e) => notifyAxiosError(e, 'Gagal memesan sesi'),
  });

  const handleBook = async () => {
    const valid = await methods.trigger();
    if (!valid) return;
    book.mutate(methods.getValues());
  };

  const STEP_FIELDS: Record<number, (keyof BookForm)[]> = {
    0: ['tutorId'],
    1: ['date', 'startTime', 'endTime', 'format', 'mode', 'subjects', 'level'],
    2: [],
  };

  const handleNext = async () => {
    const ok = await methods.trigger(STEP_FIELDS[step], { shouldFocus: true });
    if (!ok) return;

    if (step === 1) {
      const v = methods.getValues();
      if (!v.date || !v.startTime || !v.endTime) return;
      const day = new Date(`${v.date}T00:00:00`).getDay();
      const startMin = hhmmToMinutes(v.startTime);
      const endMin = hhmmToMinutes(v.endTime);
      const slots = avail.data ?? [];
      const within = slots.some(
        (s) =>
          s.dayOfWeek === day && startMin >= s.startMin && endMin <= s.endMin,
      );
      if (!within) {
        notifyError('Waktu yang dipilih di luar jadwal ketersediaan tutor.');
        return;
      }
    }

    setStep((s) => s + 1);
  };

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={CalendarPlus}
        title='Pesan Sesi'
        description='Tiga langkah singkat untuk mengatur sesi belajar.'
      />

      <Stepper steps={['Tutor', 'Jadwal', 'Konfirmasi']} current={step} />

      <FormProvider {...methods}>
        <div
          onKeyDown={(e) => {
            if (
              e.key === 'Enter' &&
              (e.target as HTMLElement).tagName !== 'TEXTAREA'
            ) {
              e.preventDefault();
            }
          }}
          className='space-y-6'
        >
          {step === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Pilih Tutor</CardTitle>
              </CardHeader>
              <CardContent>
                {apps.isLoading ? (
                  <Skeleton className='h-32 w-full' />
                ) : acceptedTutors.length === 0 ? (
                  <EmptyState
                    icon={CalendarPlus}
                    title='Belum ada tutor diterima'
                    description='Ajukan belajar ke tutor terlebih dahulu lewat halaman Cari Tutor.'
                    action={
                      <Button
                        type='button'
                        onClick={() => router.push('/student/tutors')}
                      >
                        Cari Tutor
                      </Button>
                    }
                  />
                ) : (
                  <div className='grid gap-3 sm:grid-cols-2'>
                    {acceptedTutors.map((t) => {
                      const selected = t.id === values.tutorId;
                      const initials = t.user.name
                        .split(' ')
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase();
                      return (
                        <button
                          key={t.id}
                          type='button'
                          onClick={() =>
                            methods.setValue('tutorId', t.id, {
                              shouldValidate: true,
                            })
                          }
                          className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                            selected
                              ? 'border-primary-400 bg-primary-50 ring-primary-200 ring-2'
                              : 'border-input hover:border-primary-200 hover:bg-primary-50/30'
                          }`}
                        >
                          <Avatar className='ring-primary-100 size-10 ring-2'>
                            <AvatarFallback className='from-primary-400 to-primary-600 bg-gradient-to-br text-xs font-bold text-white'>
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className='min-w-0 flex-1'>
                            <div className='truncate font-semibold'>
                              {t.user.name}
                            </div>
                            <div className='text-muted-foreground mono text-xs'>
                              {t.hourlyRate
                                ? `${formatRupiah(t.hourlyRate)}/jam`
                                : 'Tarif belum diatur'}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          {step === 1 ? (
            <Card>
              <CardHeader>
                <CardTitle>Pilih Jadwal</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {avail.isLoading ? (
                  <Skeleton className='h-20 w-full' />
                ) : (
                  <div className='bg-primary-50/40 border-primary-100 rounded-lg border p-3'>
                    <div className='text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase'>
                      Ketersediaan Tutor
                    </div>
                    {(avail.data ?? []).length === 0 ? (
                      <p className='text-muted-foreground text-sm'>
                        Tutor belum mengatur jadwal.
                      </p>
                    ) : (
                      <ul className='space-y-1 text-sm'>
                        {(avail.data ?? []).map((s) => (
                          <li
                            key={s.id}
                            className='mono flex items-center justify-between'
                          >
                            <span>{DAYS[s.dayOfWeek]}</span>
                            <span>
                              {minutesToHHmm(s.startMin)} –{' '}
                              {minutesToHHmm(s.endMin)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <TextField<BookForm> name='date' label='Tanggal' type='date' />
                <div className='grid gap-3 sm:grid-cols-2'>
                  <TextField<BookForm>
                    name='startTime'
                    label='Mulai'
                    type='time'
                  />
                  <TextField<BookForm>
                    name='endTime'
                    label='Selesai'
                    type='time'
                  />
                </div>
                <div className='grid gap-3 sm:grid-cols-2'>
                  <SelectField<BookForm>
                    name='format'
                    label='Format'
                    options={CLASS_FORMAT_OPTIONS}
                    className='w-full'
                  />
                  <SelectField<BookForm>
                    name='mode'
                    label='Mode'
                    options={CLASS_MODE_OPTIONS}
                    className='w-full'
                  />
                </div>
                <SelectField<BookForm>
                  name='level'
                  label='Jenjang'
                  options={EDUCATION_LEVEL_OPTIONS}
                  className='w-full'
                />
                <MultiToggleField<BookForm>
                  name='subjects'
                  label='Mata pelajaran'
                  options={SUBJECT_OPTIONS}
                  helperText='Pilih satu atau lebih.'
                />
              </CardContent>
            </Card>
          ) : null}

          {step === 2 ? (
            <Card>
              <CardHeader>
                <CardTitle>Konfirmasi</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 text-sm'>
                <Row label='Tutor' value={selectedTutor?.user.name ?? '—'} />
                <Row label='Tanggal' value={values.date} />
                <Row
                  label='Waktu'
                  value={`${values.startTime} – ${values.endTime}`}
                />
                <Row label='Format' value={classFormatLabel(values.format)} />
                <Row label='Mode' value={classModeLabel(values.mode)} />
                <Row
                  label='Jenjang'
                  value={educationLevelLabel(values.level)}
                />
                <Row
                  label='Mata pelajaran'
                  value={subjectLabels(values.subjects ?? []).join(', ') || '—'}
                />
                <div className='border-primary-200 from-primary-50 to-primary-100 mt-3 rounded-lg border bg-gradient-to-br p-3'>
                  <div className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>
                    Total
                  </div>
                  {(() => {
                    const rate = selectedTutor?.hourlyRate ?? 0;
                    let hours = 0;
                    if (values.date && values.startTime && values.endTime) {
                      const s = new Date(
                        `${values.date}T${values.startTime}:00`,
                      ).getTime();
                      const e = new Date(
                        `${values.date}T${values.endTime}:00`,
                      ).getTime();
                      if (e > s) hours = (e - s) / 3_600_000;
                    }
                    const total = Math.round(rate * hours);
                    return (
                      <>
                        <div className='mono text-primary-900 text-2xl font-bold'>
                          {total > 0 ? formatRupiah(total) : '—'}
                        </div>
                        {hours > 0 ? (
                          <div className='text-muted-foreground mt-1 text-xs'>
                            {formatRupiah(rate)} × {hours} jam
                          </div>
                        ) : null}
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <div className='flex justify-between'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              Kembali
            </Button>
            {step < 2 ? (
              <Button type='button' onClick={handleNext}>
                Lanjut
              </Button>
            ) : (
              <Button
                type='button'
                onClick={handleBook}
                disabled={book.isPending}
              >
                {book.isPending ? 'Memesan...' : 'Pesan Sesi'}
              </Button>
            )}
          </div>
        </div>
      </FormProvider>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-center justify-between gap-3 border-b py-1.5 last:border-0'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='font-medium'>{value}</span>
    </div>
  );
}
