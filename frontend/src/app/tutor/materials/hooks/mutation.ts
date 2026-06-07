'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@/lib/api';
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
      const fd = new FormData();
      fd.append('file', values.file);
      if (values.subject) fd.append('subject', values.subject);
      if (values.level) fd.append('level', values.level);
      if (values.kind) fd.append('kind', values.kind);
      if (values.description) fd.append('description', values.description);
      if (values.allowedStudents) {
        for (const id of values.allowedStudents)
          fd.append('allowedStudents', id);
      }
      const res = await api.post('/materials/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
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
