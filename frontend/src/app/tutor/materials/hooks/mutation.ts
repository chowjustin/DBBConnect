'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@/lib/api';
import { uploadFile } from '@/lib/upload';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';

export function useUploadMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      file: File;
      subject?: string;
      level?: string;
      kind?: string;
      description?: string;
      allowedStudents?: string[];
    }) => {
      const uploaded = await uploadFile(values.file, 'material');
      const res = await api.post('/materials', {
        fileUrl: uploaded.file_url,
        originalName: values.file.name,
        subject: values.subject,
        level: values.level,
        kind: values.kind,
        description: values.description,
        allowedStudents: values.allowedStudents,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/materials/tutor'] });
      notifySuccess('Materi diunggah');
    },
    onError: (e) => notifyAxiosError(e),
  });
}
