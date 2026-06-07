'use client';

import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

function hhmmToMinutes(s: string): number {
  const [h, m] = s.split(':').map((v) => parseInt(v, 10) || 0);
  return h * 60 + m;
}

function minutesToHHmm(m: number): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export default function AvailabilityPage() {
  const [slots, setSlots] = React.useState<AvailabilitySlot[]>([
    { dayOfWeek: 1, startMin: 9 * 60, endMin: 11 * 60, timezone: TIMEZONE },
  ]);

  const update = useUpdateAvailability();

  const addSlot = () =>
    setSlots((s) => [
      ...s,
      { dayOfWeek: 1, startMin: 9 * 60, endMin: 10 * 60, timezone: TIMEZONE },
    ]);

  const removeSlot = (i: number) =>
    setSlots((s) => s.filter((_, idx) => idx !== i));

  const updateSlot = (i: number, patch: Partial<AvailabilitySlot>) =>
    setSlots((s) =>
      s.map((slot, idx) => (idx === i ? { ...slot, ...patch } : slot)),
    );

  const onSave = () => {
    for (const s of slots) {
      if (s.endMin <= s.startMin) {
        return alert('Waktu selesai harus setelah waktu mulai');
      }
    }
    const req: UpdateAvailabilityRequest = {
      slots: slots.map(({ id: _id, ...rest }) => rest),
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
            Zona waktu: <code>{TIMEZONE}</code>
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          {slots.map((slot, i) => (
            <div
              key={i}
              className='grid grid-cols-[1fr_auto_auto_auto] items-end gap-2'
            >
              <div className='space-y-1'>
                <Label>Hari</Label>
                <Select
                  value={String(slot.dayOfWeek)}
                  onValueChange={(v) => updateSlot(i, { dayOfWeek: Number(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d, idx) => (
                      <SelectItem key={d} value={String(idx)}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-1'>
                <Label>Mulai</Label>
                <Input
                  type='time'
                  value={minutesToHHmm(slot.startMin)}
                  onChange={(e) =>
                    updateSlot(i, {
                      startMin: hhmmToMinutes(e.target.value),
                    })
                  }
                />
              </div>
              <div className='space-y-1'>
                <Label>Selesai</Label>
                <Input
                  type='time'
                  value={minutesToHHmm(slot.endMin)}
                  onChange={(e) =>
                    updateSlot(i, {
                      endMin: hhmmToMinutes(e.target.value),
                    })
                  }
                />
              </div>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                aria-label='Hapus slot'
                onClick={() => removeSlot(i)}
              >
                <Trash2 className='size-4' />
              </Button>
            </div>
          ))}
          <Button type='button' variant='outline' onClick={addSlot}>
            <Plus className='size-4' /> Tambah slot
          </Button>
        </CardContent>
      </Card>

      <Button onClick={onSave} disabled={update.isPending}>
        {update.isPending ? 'Menyimpan...' : 'Simpan jadwal'}
      </Button>
    </div>
  );
}
