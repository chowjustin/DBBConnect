'use client';

import { useQuery } from '@tanstack/react-query';

import api from '@/lib/api';
import useAuthStore from '@/store/use-auth-store';
import { Button } from '@/components/ui/button';
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
import { apiUrl } from '@/constant/env';
import { getToken } from '@/lib/cookie';
import { usePagination } from '@/hooks/use-pagination';
import type { PaginatedApiResponse } from '@/types/api';

interface MaterialRow {
  id: string;
  title: string | null;
  fileName: string | null;
  createdAt: string;
  tutor?: { user: { name: string } };
}

export default function StudentMaterialsPage() {
  const user = useAuthStore.useUser();
  const { params } = usePagination();

  const { data, isLoading } = useQuery<{
    data: MaterialRow[];
    meta: PaginatedApiResponse<MaterialRow[]>['meta'];
  }>({
    queryKey: ['/materials/student', user?.id, params],
    queryFn: async () => {
      const res = await api.get(`/materials/student/${user!.id}`, { params });
      return res.data;
    },
    enabled: !!user?.id,
  });

  const download = async (id: string, fileName: string | null) => {
    const token = getToken();
    await api.post(`/tracking/material-view`, { materialId: id }).catch(() => {});
    const res = await fetch(`${apiUrl}/api/upload/material/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName ?? `material-${id}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className='space-y-4'>
      <h1 className='h2'>Materi</h1>
      {isLoading ? (
        <Skeleton className='h-40 w-full' />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Tutor</TableHead>
              <TableHead>File</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{formatDateId(m.createdAt)}</TableCell>
                <TableCell>{m.tutor?.user.name ?? '—'}</TableCell>
                <TableCell>{m.fileName ?? m.title ?? '—'}</TableCell>
                <TableCell>
                  <Button
                    size='sm'
                    onClick={() => download(m.id, m.fileName)}
                  >
                    Unduh
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
