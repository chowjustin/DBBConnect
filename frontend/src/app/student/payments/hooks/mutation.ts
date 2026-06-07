'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@/lib/api';
import { withIdempotency } from '@/lib/idempotency';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';

import type { UploadProofForm } from '../types';

export function useUploadProof() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: UploadProofForm) => {
      if (!values.proofImage) throw new Error('Pilih file bukti');
      const fd = new FormData();
      fd.append('kind', values.kind);
      fd.append('refId', values.refId);
      fd.append('method', values.method);
      if (values.promoCode) fd.append('promoCode', values.promoCode);
      fd.append('proofImage', values.proofImage);
      const res = await api.post('/payments/upload-proof', fd, {
        ...withIdempotency(),
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/payments/mine'] });
      notifySuccess('Bukti pembayaran terkirim');
    },
    onError: (e) => notifyAxiosError(e, 'Gagal mengirim bukti'),
  });
}
