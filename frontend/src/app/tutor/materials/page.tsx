'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, FolderOpen, UploadCloud, X } from 'lucide-react';

import api from '@/lib/api';
import useAuthStore from '@/store/use-auth-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDateId } from '@/lib/format';
import { usePagination } from '@/hooks/use-pagination';
import { cn } from '@/lib/utils';
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

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function TutorMaterialsPage() {
  const user = useAuthStore.useUser();
  const tutorProfileId = user?.tutorProfileId;
  const { params } = usePagination();
  const [file, setFile] = React.useState<File | null>(null);
  const [description, setDescription] = React.useState('');
  const [dragOver, setDragOver] = React.useState(false);
  const upload = useUploadMaterial();

  const tutorQuery = useQuery<{
    data: MaterialRow[];
    meta: PaginatedApiResponse<MaterialRow[]>['meta'];
  }>({
    queryKey: ['/materials/tutor', tutorProfileId, params],
    queryFn: async () => {
      const res = await api.get(`/materials/tutor/${tutorProfileId}`, {
        params,
      });
      return res.data;
    },
    enabled: !!tutorProfileId,
  });

  const onUpload = () => {
    if (!file) return;
    upload.mutate(
      { file, description: description || undefined },
      {
        onSuccess: () => {
          setFile(null);
          setDescription('');
        },
      },
    );
  };

  const handleFiles = (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) {
      alert('Ukuran file melebihi 20 MB');
      return;
    }
    setFile(f);
  };

  const empty =
    !tutorQuery.isLoading && (tutorQuery.data?.data.length ?? 0) === 0;

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={FolderOpen}
        title='Materi'
        description='Unggah materi ajar yang dapat diakses siswa Anda.'
      />

      <Card className='hover:shadow-primary-500/5 transition-shadow hover:shadow-md'>
        <CardHeader>
          <CardTitle>Unggah Materi</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {file ? (
            <div className='border-primary-200 bg-primary-50/30 flex items-center gap-3 rounded-lg border p-3'>
              <div className='bg-primary-100 text-primary-700 flex size-14 shrink-0 items-center justify-center rounded-md'>
                <FileText className='size-6' />
              </div>
              <div className='min-w-0 flex-1 text-sm'>
                <div className='truncate font-medium'>{file.name}</div>
                <div className='text-muted-foreground mono text-xs'>
                  {formatSize(file.size)}
                </div>
              </div>
              <Button
                type='button'
                variant='ghost'
                size='icon-sm'
                aria-label='Hapus file'
                onClick={() => setFile(null)}
              >
                <X className='size-4' />
              </Button>
            </div>
          ) : (
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFiles(e.dataTransfer.files);
              }}
              className={cn(
                'flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center transition-all',
                dragOver
                  ? 'border-primary-500 bg-primary-50 scale-[1.01]'
                  : 'border-primary-200 hover:border-primary-300 hover:bg-primary-50/40',
              )}
            >
              <div className='bg-primary-100 text-primary-700 rounded-full p-3'>
                <UploadCloud className='size-6' />
              </div>
              <div>
                <div className='text-sm font-medium'>
                  Klik atau seret file ke sini
                </div>
                <div className='text-muted-foreground mt-1 text-xs'>
                  Maks 20 MB · PDF, PNG, JPG
                </div>
              </div>
              <input
                type='file'
                accept='.pdf,.jpg,.jpeg,.png'
                className='sr-only'
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>
          )}

          <div className='space-y-1.5'>
            <Label>Deskripsi (opsional)</Label>
            <Textarea
              placeholder='Ringkasan singkat materi...'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

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
          ) : empty ? (
            <EmptyState
              icon={FolderOpen}
              title='Belum ada materi'
              description='Unggah materi pertama Anda menggunakan form di atas.'
            />
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
