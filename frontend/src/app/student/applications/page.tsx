'use client';

import { useQuery } from '@tanstack/react-query';

import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { APPLICATION_STATUS } from '@/lib/status';
import { formatDateId } from '@/lib/format';
import { usePagination } from '@/hooks/use-pagination';
import type { PaginatedApiResponse } from '@/types/api';
import type { ApplicationStatus } from '@/types/shared';

interface ApplicationRow {
  id: string;
  status: ApplicationStatus;
  message: string | null;
  createdAt: string;
  tutor: { user: { name: string } };
}

export default function StudentApplicationsPage() {
  const { params } = usePagination();
  const { data, isLoading } = useQuery<{
    data: ApplicationRow[];
    meta: PaginatedApiResponse<ApplicationRow[]>['meta'];
  }>({
    queryKey: ['/applications/student', params],
    queryFn: async () => {
      const res = await api.get('/applications/student', { params });
      return res.data;
    },
  });

  return (
    <div className='space-y-4'>
      <h1 className='h2'>Aplikasi Saya</h1>
      {isLoading ? (
        <Skeleton className='h-40 w-full' />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tutor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pesan</TableHead>
              <TableHead>Tanggal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((app) => {
              const meta = APPLICATION_STATUS[app.status];
              return (
                <TableRow key={app.id}>
                  <TableCell>{app.tutor.user.name}</TableCell>
                  <TableCell>
                    <Badge className={`${meta.className} border-0`}>
                      {meta.label}
                    </Badge>
                  </TableCell>
                  <TableCell className='max-w-xs truncate'>
                    {app.message ?? '—'}
                  </TableCell>
                  <TableCell>{formatDateId(app.createdAt)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
