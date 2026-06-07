'use client';

import * as React from 'react';
import { useMutation } from '@tanstack/react-query';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRupiah } from '@/lib/format';
import { FEATURED_PRICE_PER_DAY } from '@/constant/common';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';

export default function FeaturedPage() {
  const [days, setDays] = React.useState('7');

  const request = useMutation({
    mutationFn: async () => {
      const res = await api.post('/featured/request', {
        days: Number(days),
      });
      return res.data;
    },
    onSuccess: (data) => {
      notifySuccess(
        'Permintaan featured dibuat',
        `Gunakan refId ${data?.refId ?? days} saat upload bukti.`,
      );
    },
    onError: (e) => notifyAxiosError(e),
  });

  const n = Number(days) || 0;
  const total = n * FEATURED_PRICE_PER_DAY;

  return (
    <div className='space-y-4'>
      <h1 className='h2'>Featured Listing</h1>
      <Card>
        <CardHeader>
          <CardTitle>Pasang Featured</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='space-y-1.5'>
            <Label>Durasi (hari)</Label>
            <Input
              type='number'
              min='1'
              max='30'
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
            <p className='text-muted-foreground text-xs'>
              {formatRupiah(FEATURED_PRICE_PER_DAY)}/hari
            </p>
          </div>
          <div className='text-sm'>
            Total: <span className='font-semibold'>{formatRupiah(total)}</span>
          </div>
          <Button
            onClick={() => request.mutate()}
            disabled={request.isPending || n <= 0}
          >
            {request.isPending ? 'Memproses...' : 'Ajukan'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
