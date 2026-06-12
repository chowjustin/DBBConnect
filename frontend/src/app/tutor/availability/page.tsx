'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

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
import { Skeleton } from '@/components/ui/skeleton';
import { TIMEZONE } from '@/constant/common';

import type { AvailabilitySlot, UpdateAvailabilityRequest } from './types';
import { useUpdateAvailability } from './hooks/mutation';
import { WeekGrid } from './components/week-grid';

interface SlotRange {
  dayOfWeek: number;
  startMin: number;
  endMin: number;
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

  const [slots, setSlots] = React.useState<SlotRange[]>([]);
  const seeded = React.useRef(false);

  React.useEffect(() => {
    if (!seeded.current && existingQ.data) {
      setSlots(
        existingQ.data.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          startMin: s.startMin,
          endMin: s.endMin,
        })),
      );
      seeded.current = true;
    }
  }, [existingQ.data]);

  const onSave = () => {
    const req: UpdateAvailabilityRequest = {
      slots: slots.map((s) => ({ ...s, timezone: TIMEZONE })),
    };
    update.mutate(req);
  };

  return (
    <div className='space-y-4'>
      <div>
        <h1 className='h2'>Ketersediaan</h1>
        <p className='text-muted-foreground text-sm'>
          Atur slot mingguan kapan Anda dapat menerima sesi.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Slot Mingguan</CardTitle>
          <CardDescription>
            Zona waktu: <code>{TIMEZONE}</code>. Setiap kotak = 15 menit.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {existingQ.isLoading ? (
            <Skeleton className='h-96 w-full' />
          ) : (
            <WeekGrid value={slots} onChange={setSlots} />
          )}
        </CardContent>
      </Card>

      <div className='flex gap-2'>
        <Button onClick={onSave} disabled={update.isPending}>
          {update.isPending ? 'Menyimpan...' : 'Simpan jadwal'}
        </Button>
        <Button
          type='button'
          variant='outline'
          onClick={() => setSlots([])}
          disabled={update.isPending || slots.length === 0}
        >
          Bersihkan
        </Button>
      </div>
    </div>
  );
}
