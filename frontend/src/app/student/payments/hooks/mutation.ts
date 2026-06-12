'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@/lib/api';
import { withIdempotency } from '@/lib/idempotency';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';
import { uploadFile } from '@/lib/upload';

import type { UploadProofForm } from '../types';

export function useUploadProof() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: UploadProofForm) => {
      if (!values.proofImage) throw new Error('Pilih file bukti');
      const { file_url: proofUrl } = await uploadFile(
        values.proofImage,
        'payment',
      );
      const res = await api.post(
        '/payments/upload-proof',
        {
          kind: values.kind,
          refId: values.refId,
          method: values.method,
          promoCode: values.promoCode || undefined,
          proofUrl,
        },
        withIdempotency(),
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/payments/mine'] });
      notifySuccess('Bukti pembayaran terkirim');
    },
    onError: (e) => notifyAxiosError(e, 'Gagal mengirim bukti'),
  });
}
