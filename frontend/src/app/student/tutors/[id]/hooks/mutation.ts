'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@/lib/api';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';

import type { ApplyRequest } from '../types';

export function useApply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: ApplyRequest) => {
      const res = await api.post('/applications', body);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/applications/student'] });
      notifySuccess('Aplikasi terkirim');
    },
    onError: (e) => notifyAxiosError(e, 'Gagal mengirim aplikasi'),
  });
}
