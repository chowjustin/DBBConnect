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
import { formatDateTimeId, formatRupiah } from '@/lib/format';
import { usePagination } from '@/hooks/use-pagination';
import { apiUrl } from '@/constant/env';
import { getToken } from '@/lib/cookie';
import type { PaginatedApiResponse } from '@/types/api';

import type { SessionItem } from './types';

export default function StudentSessionsPage() {
  const { params } = usePagination();
  const [past, setPast] = React.useState(false);

  const { data, isLoading } = useQuery<{
    data: SessionItem[];
    meta: PaginatedApiResponse<SessionItem[]>['meta'];
  }>({
    queryKey: ['/sessions/student', { ...params, past }],
    queryFn: async () => {
      const res = await api.get('/sessions/student', {
        params: { ...params, past },
      });
      return res.data;
    },
  });

  const downloadIcal = async (id: string) => {
    const token = getToken();
    const res = await fetch(`${apiUrl}/api/sessions/${id}/ical`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const text = await res.text();
    const blob = new Blob([text], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${id}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h1 className='h2'>Sesi Saya</h1>
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
              <TableHead>Tutor</TableHead>
              <TableHead>Mulai</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((s) => {
              const m = SESSION_STATUS[s.status];
              return (
                <TableRow key={s.id}>
                  <TableCell>{s.tutor?.user.name ?? '—'}</TableCell>
                  <TableCell>{formatDateTimeId(s.startsAt)}</TableCell>
                  <TableCell>{s.format}</TableCell>
                  <TableCell>
                    <Badge className={`${m.className} border-0`}>{m.label}</Badge>
                  </TableCell>
                  <TableCell>{formatRupiah(s.pricePerSeat)}</TableCell>
                  <TableCell>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => downloadIcal(s.id)}
                    >
                      iCal
                    </Button>
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
