import { CheckCircle2, Circle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { CompletenessResponse } from '../types';

interface Props {
  data: CompletenessResponse | undefined;
  isLoading: boolean;
}

const FIELD_LABELS: Record<string, string> = {
  bio: 'Bio',
  educationBackground: 'Latar Belakang Pendidikan',
  teachingMethods: 'Metode Mengajar',
  educationLevels: 'Jenjang yang Diajar',
  subjects: 'Mata Pelajaran',
  hourlyRate: 'Tarif per Jam',
  introVideoUrl: 'Video Perkenalan',
  whatsappNumber: 'Nomor WhatsApp',
  bank: 'Rekening Bank',
  availability: 'Jadwal Ketersediaan',
  verification: 'Verifikasi Admin',
};

function label(key: string): string {
  return FIELD_LABELS[key] ?? key;
}

export function CompletenessCard({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kelengkapan Profil</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={0} />
        </CardContent>
      </Card>
    );
  }

  const ready = data.score >= data.minRequired;

  return (
    <Card className='hover:shadow-primary-500/5 transition-shadow hover:shadow-md'>
      <CardHeader>
        <CardTitle className='flex items-center justify-between gap-3'>
          <span>Kelengkapan Profil</span>
          <span
            className={`mono text-base font-bold ${
              ready ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {data.score}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <Progress value={data.score} />
        <p className='text-muted-foreground text-xs'>
          Minimum {data.minRequired}% untuk publikasi.
        </p>
        {data.missing.length ? (
          <div className='space-y-1.5'>
            <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
              Belum lengkap
            </p>
            <ul className='space-y-1.5 text-sm'>
              {data.missing.map((item) => (
                <li key={item} className='flex items-center gap-2'>
                  <Circle className='text-muted-foreground size-3.5 shrink-0' />
                  <span>{label(item)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className='flex items-center gap-2 text-sm text-emerald-700'>
            <CheckCircle2 className='size-4' /> Semua kriteria terpenuhi
          </p>
        )}
      </CardContent>
    </Card>
  );
}
