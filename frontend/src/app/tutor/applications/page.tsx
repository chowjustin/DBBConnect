'use client';

import { useQuery } from '@tanstack/react-query';

import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
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
import { APPLICATION_STATUS } from '@/lib/status';
import { formatDateId } from '@/lib/format';
import { usePagination } from '@/hooks/use-pagination';
import type { PaginatedApiResponse } from '@/types/api';
import type { ApplicationStatus } from '@/types/shared';

import { useUpdateApplicationStatus } from './hooks/mutation';

interface ApplicationRow {
  id: string;
  status: ApplicationStatus;
  message: string | null;
  createdAt: string;
  student: { user: { name: string; email: string } };
}

export default function TutorApplicationsPage() {
  const { params } = usePagination();
  const updateStatus = useUpdateApplicationStatus();

  const { data, isLoading } = useQuery<{
    data: ApplicationRow[];
    meta: PaginatedApiResponse<ApplicationRow[]>['meta'];
  }>({
    queryKey: ['/applications/tutor', params],
    queryFn: async () => {
      const res = await api.get('/applications/tutor', { params });
      return res.data;
    },
  });

  return (
    <div className='space-y-4'>
      <h1 className='h2'>Aplikasi Siswa</h1>
      {isLoading ? (
        <Skeleton className='h-40 w-full' />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Siswa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pesan</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((app) => {
              const m = APPLICATION_STATUS[app.status];
              return (
                <TableRow key={app.id}>
                  <TableCell>
                    <div>{app.student.user.name}</div>
                    <div className='text-muted-foreground text-xs'>
                      {app.student.user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${m.className} border-0`}>{m.label}</Badge>
                  </TableCell>
                  <TableCell className='max-w-xs truncate'>
                    {app.message ?? '—'}
                  </TableCell>
                  <TableCell>{formatDateId(app.createdAt)}</TableCell>
                  <TableCell>
                    {app.status === 'PENDING' ? (
                      <div className='flex gap-2'>
                        <Button
                          size='sm'
                          onClick={() =>
                            updateStatus.mutate({
                              id: app.id,
                              status: 'ACCEPTED',
                            })
                          }
                        >
                          Terima
                        </Button>
                        <Button
                          size='sm'
                          variant='destructive'
                          onClick={() =>
                            updateStatus.mutate({
                              id: app.id,
                              status: 'REJECTED',
                            })
                          }
                        >
                          Tolak
                        </Button>
                      </div>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
