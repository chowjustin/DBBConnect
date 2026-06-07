'use client';

import { useMutation, useQuery } from '@tanstack/react-query';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDateId } from '@/lib/format';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';
import type { PlanTier } from '@/types/shared';

interface MeSub {
  tier: PlanTier;
  expiresAt: string | null;
}

interface Props {
  tier: 'PREMIUM_STUDENT' | 'PRO_TUTOR';
  description: string;
}

export function SubscriptionCard({ tier, description }: Props) {
  const meQ = useQuery<MeSub>({ queryKey: ['/subscription/me'] });

  const request = useMutation({
    mutationFn: async () => {
      const res = await api.post('/subscription/request', { tier });
      return res.data;
    },
    onSuccess: (data) => {
      notifySuccess(
        'Permintaan langganan dibuat',
        `Gunakan refId ${data?.refId ?? tier} saat upload bukti.`,
      );
    },
    onError: (e) => notifyAxiosError(e),
  });

  const active = meQ.data?.tier === tier;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          {tier === 'PREMIUM_STUDENT' ? 'Premium Siswa' : 'Pro Tutor'}
          {active ? <Badge>Aktif</Badge> : null}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3 text-sm'>
        <p className='text-muted-foreground'>{description}</p>
        {meQ.isLoading ? (
          <Skeleton className='h-4 w-32' />
        ) : meQ.data?.expiresAt ? (
          <p className='text-muted-foreground text-xs'>
            Berakhir {formatDateId(meQ.data.expiresAt)}
          </p>
        ) : null}
        <Button
          onClick={() => request.mutate()}
          disabled={request.isPending || active}
        >
          {active
            ? 'Aktif'
            : request.isPending
              ? 'Memproses...'
              : 'Berlangganan'}
        </Button>
      </CardContent>
    </Card>
  );
}
