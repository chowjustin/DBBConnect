'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import api from '@/lib/api';
import useAuthStore from '@/store/use-auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateId } from '@/lib/format';
import { usePagination } from '@/hooks/use-pagination';
import type { PaginatedApiResponse } from '@/types/api';

import { useUploadMaterial } from './hooks/mutation';

interface MaterialRow {
  id: string;
  title: string | null;
  fileName: string | null;
  subject: string | null;
  level: string | null;
  kind: string | null;
  createdAt: string;
}

export default function TutorMaterialsPage() {
  const user = useAuthStore.useUser();
  const { params } = usePagination();
  const [file, setFile] = React.useState<File | null>(null);
  const [description, setDescription] = React.useState('');
  const upload = useUploadMaterial();

  const tutorQuery = useQuery<{
    data: MaterialRow[];
    meta: PaginatedApiResponse<MaterialRow[]>['meta'];
  }>({
    queryKey: ['/materials/tutor', user?.id, params],
    queryFn: async () => {
      const res = await api.get(`/materials/tutor/${user!.id}`, { params });
      return res.data;
    },
    enabled: !!user?.id,
  });

  const onUpload = () => {
    if (!file) return alert('Pilih file');
    upload.mutate(
      { file, description: description || undefined },
      { onSuccess: () => { setFile(null); setDescription(''); } },
    );
  };

  return (
    <div className='space-y-4'>
      <h1 className='h2'>Materi</h1>

      <Card>
        <CardHeader>
          <CardTitle>Unggah Materi</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='space-y-1.5'>
            <Label>File (maks 20MB)</Label>
            <Input
              type='file'
              accept='.pdf,.jpg,.jpeg,.png'
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <Textarea
            placeholder='Deskripsi materi (opsional)'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
          <Button onClick={onUpload} disabled={upload.isPending || !file}>
            {upload.isPending ? 'Mengunggah...' : 'Unggah'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Materi</CardTitle>
        </CardHeader>
        <CardContent>
          {tutorQuery.isLoading ? (
            <Skeleton className='h-40 w-full' />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Nama File</TableHead>
                  <TableHead>Mapel</TableHead>
                  <TableHead>Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tutorQuery.data?.data.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{formatDateId(m.createdAt)}</TableCell>
                    <TableCell>{m.fileName ?? m.title ?? '—'}</TableCell>
                    <TableCell>{m.subject ?? '—'}</TableCell>
                    <TableCell>{m.level ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
