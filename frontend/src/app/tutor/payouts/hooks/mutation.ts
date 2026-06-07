'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@/lib/api';
import { withIdempotency } from '@/lib/idempotency';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';

export function useRequestPayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (amount: number) => {
      const res = await api.post(
        '/tutor/payouts',
        { amount },
        withIdempotency(),
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/tutor/payouts'] });
      qc.invalidateQueries({ queryKey: ['/tutor/wallet'] });
      notifySuccess('Permintaan pencairan terkirim');
    },
    onError: (e) => notifyAxiosError(e, 'Gagal mengajukan pencairan'),
  });
}
