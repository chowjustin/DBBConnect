'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@/lib/api';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';
import type { ApplicationStatus } from '@/types/shared';

export function useUpdateApplicationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: ApplicationStatus;
    }) => {
      const res = await api.patch(`/applications/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/applications/tutor'] });
      notifySuccess('Status diperbarui');
    },
    onError: (e) => notifyAxiosError(e, 'Gagal memperbarui status'),
  });
}
