import { useMutation } from '@tanstack/react-query';

import api from '@/lib/api';

export type UploadKind =
  | 'profile'
  | 'material'
  | 'verification'
  | 'payment'
  | 'payout';

export interface UploadResult {
  kind: UploadKind;
  file_url: string;
  path: string;
}

/**
 * Upload a file to the generic POST /upload/file endpoint.
 * Returns the server-side path + absolute file_url to attach in subsequent
 * JSON create/update calls.
 */
export async function uploadFile(
  file: File,
  kind: UploadKind,
): Promise<UploadResult> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await api.post<UploadResult>('/upload/file', fd, {
    params: { kind },
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

/** TanStack mutation wrapper around `uploadFile`. */
export function useUploadFile() {
  return useMutation({
    mutationFn: ({ file, kind }: { file: File; kind: UploadKind }) =>
      uploadFile(file, kind),
  });
}
