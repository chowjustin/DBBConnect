'use client';

import * as React from 'react';
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
import { SESSION_STATUS } from '@/lib/status';
import { formatDateTimeId } from '@/lib/format';
import { usePagination } from '@/hooks/use-pagination';
import type { PaginatedApiResponse } from '@/types/api';
import type { SessionItem } from '@/app/student/sessions/types';

export default function TutorSessionsPage() {
  const { params } = usePagination();
  const [past, setPast] = React.useState(false);

  const { data, isLoading } = useQuery<{
    data: SessionItem[];
    meta: PaginatedApiResponse<SessionItem[]>['meta'];
  }>({
    queryKey: ['/sessions/tutor', { ...params, past }],
    queryFn: async () => {
      const res = await api.get('/sessions/tutor', {
        params: { ...params, past },
      });
      return res.data;
    },
  });

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h1 className='h2'>Sesi</h1>
        <Button variant='outline' size='sm' onClick={() => setPast((p) => !p)}>
          {past ? 'Mendatang' : 'Riwayat'}
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className='h-40 w-full' />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mulai</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Peserta</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((s) => {
              const m = SESSION_STATUS[s.status];
              return (
                <TableRow key={s.id}>
                  <TableCell>{formatDateTimeId(s.startsAt)}</TableCell>
                  <TableCell>{s.format}</TableCell>
                  <TableCell>{s.attendees?.length ?? 0}</TableCell>
                  <TableCell>
                    <Badge className={`${m.className} border-0`}>{m.label}</Badge>
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
