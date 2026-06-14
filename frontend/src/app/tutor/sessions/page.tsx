'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Eye } from 'lucide-react';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDateId, formatTimeId } from '@/lib/format';
import { classFormatLabel } from '@/constant/enums';
import { usePagination } from '@/hooks/use-pagination';
import type { PaginatedApiResponse } from '@/types/api';
import type { SessionItem } from '@/app/student/sessions/types';

import { WeekCalendar } from './components/week-calendar';
import { SessionDetailDialog } from './components/session-detail-dialog';
import { CancelSessionButton } from '@/components/sessions/cancel-session-button';
import { RescheduleSessionButton } from '@/components/sessions/reschedule-session-button';

export default function TutorSessionsPage() {
  const { params } = usePagination();
  const [past, setPast] = React.useState(false);
  const [view, setView] = React.useState<'calendar' | 'list'>('calendar');
  const [selected, setSelected] = React.useState<SessionItem | null>(null);

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

      <div className='flex flex-wrap items-center justify-between gap-3'>
        <Tabs
          value={past ? 'past' : 'upcoming'}
          onValueChange={(v) => setPast(v === 'past')}
        >
          <TabsList>
            <TabsTrigger value='upcoming'>Mendatang</TabsTrigger>
            <TabsTrigger value='past'>Riwayat</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs
          value={view}
          onValueChange={(v) => setView(v as 'calendar' | 'list')}
        >
          <TabsList>
            <TabsTrigger value='calendar'>Kalender</TabsTrigger>
            <TabsTrigger value='list'>Tabel</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <Skeleton className='h-96 w-full' />
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
      ) : view === 'calendar' ? (
        <WeekCalendar sessions={data?.data ?? []} onSelect={setSelected} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Waktu</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Siswa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.length === 0 ? (
              <TableEmpty colSpan={6}>Tidak ada sesi.</TableEmpty>
            ) : (
              data?.data.map((s) => {
                const names =
                  s.attendees
                    ?.map((a) => a.student?.user.name)
                    .filter(Boolean) ?? [];
                return (
                  <TableRow key={s.id}>
                    <TableCell className='mono text-xs tabular-nums'>
                      {formatDateId(s.startsAt)}
                    </TableCell>
                    <TableCell className='mono text-xs tabular-nums'>
                      {formatTimeId(s.startsAt)} – {formatTimeId(s.endsAt)}
                    </TableCell>
                    <TableCell>{classFormatLabel(s.format)}</TableCell>
                    <TableCell>
                      {names.length === 0 ? (
                        <span className='text-muted-foreground text-xs'>—</span>
                      ) : (
                        <div className='flex flex-col text-sm'>
                          <span>{names[0]}</span>
                          {names.length > 1 ? (
                            <span className='text-muted-foreground text-xs'>
                              +{names.length - 1} lainnya
                            </span>
                          ) : null}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge kind='session' status={s.status} />
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex items-center justify-end gap-2'>
                        {(() => {
                          const hasLivePayment = !!s.attendees?.some(
                            (a) =>
                              a.payment?.status === 'UNDER_REVIEW' ||
                              a.payment?.status === 'CONFIRMED',
                          );
                          return (
                            <>
                              <RescheduleSessionButton
                                sessionId={s.id}
                                startsAt={s.startsAt}
                                endsAt={s.endsAt}
                                status={s.status}
                              />
                              <CancelSessionButton
                                sessionId={s.id}
                                startsAt={s.startsAt}
                                status={s.status}
                                hasLivePayment={hasLivePayment}
                              />
                            </>
                          );
                        })()}
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon-sm'
                          aria-label='Lihat detail'
                          onClick={() => setSelected(s)}
                        >
                          <Eye className='size-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      )}

      <SessionDetailDialog
        session={selected}
        onOpenChange={(v) => !v && setSelected(null)}
      />
    </div>
  );
}
