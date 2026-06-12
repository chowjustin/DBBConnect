'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays } from 'lucide-react';

import api from '@/lib/api';
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
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDateTimeId } from '@/lib/format';
import { classFormatLabel } from '@/constant/enums';
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

  const empty = !isLoading && (data?.data.length ?? 0) === 0;

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={CalendarDays}
        title='Sesi'
        description={past ? 'Riwayat sesi mengajar.' : 'Sesi mendatang.'}
      />
      <Tabs
        value={past ? 'past' : 'upcoming'}
        onValueChange={(v) => setPast(v === 'past')}
      >
        <TabsList>
          <TabsTrigger value='upcoming'>Mendatang</TabsTrigger>
          <TabsTrigger value='past'>Riwayat</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <Skeleton className='h-40 w-full' />
      ) : empty ? (
        <EmptyState
          icon={CalendarDays}
          title={past ? 'Belum ada riwayat sesi' : 'Belum ada sesi terjadwal'}
          description={
            past
              ? 'Sesi yang sudah selesai akan tampil di sini.'
              : 'Siswa yang sudah diterima akan memesan sesi di sini.'
          }
        />
      ) : (
        <div className='border-primary-100 overflow-hidden rounded-lg border bg-white'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mulai</TableHead>
                <TableHead>Format</TableHead>
                <TableHead className='text-right'>Peserta</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className='mono text-xs tabular-nums'>
                    {formatDateTimeId(s.startsAt)}
                  </TableCell>
                  <TableCell>{classFormatLabel(s.format)}</TableCell>
                  <TableCell className='mono text-right tabular-nums'>
                    {s.attendees?.length ?? 0}
                  </TableCell>
                  <TableCell>
                    <StatusBadge kind='session' status={s.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
