'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@/lib/api';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';

export function useConfirmPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/admin/payments/${id}/confirm`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/admin/payments'] });
      qc.invalidateQueries({ queryKey: ['/admin/payments/history'] });
      notifySuccess('Pembayaran dikonfirmasi');
    },
    onError: (e) => notifyAxiosError(e),
  });
}

export function useRejectPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const res = await api.patch(`/admin/payments/${id}/reject`, { notes });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/admin/payments'] });
      qc.invalidateQueries({ queryKey: ['/admin/payments/history'] });
      notifySuccess('Pembayaran ditolak');
    },
    onError: (e) => notifyAxiosError(e),
  });
}
