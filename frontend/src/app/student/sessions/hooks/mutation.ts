'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@/lib/api';
import { withIdempotency } from '@/lib/idempotency';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';

import type { BookSessionRequest } from '../types';

export function useBookSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: BookSessionRequest) => {
      const res = await api.post('/sessions', body, withIdempotency());
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/sessions/student'] });
      notifySuccess('Sesi berhasil dipesan');
    },
    onError: (e) => notifyAxiosError(e, 'Gagal memesan sesi'),
  });
}
