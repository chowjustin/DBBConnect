'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { GraduationCap, Star } from 'lucide-react';

import {
  educationLevelLabels,
  subjectLabels,
  teachingMethodLabels,
} from '@/constant/enums';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PageHeader } from '@/components/ui/page-header';
import { formatRupiah } from '@/lib/format';

import { useActiveApplicationByTutor } from '../hooks/use-my-applications';

import { ApplyDialog } from './components/apply-dialog';

interface TutorDetail {
  id: string;
  bio: string | null;
  hourlyRate: number | null;
  subjects: string[];
  educationLevels: string[];
  teachingMethods: string[];
  educationBackground: string | null;
  experience: number | null;
  user: { id: string; name: string; email: string };
}

interface ReviewsAggregate {
  total: number;
  average: number;
}

export default function StudentTutorDetailPage() {
  const params = useParams<{ id: string }>();
  const tutorId = params.id;
  const [open, setOpen] = React.useState(false);

  const tutorQ = useQuery<TutorDetail>({
    queryKey: [`/tutors/by-id/${tutorId}`],
    enabled: !!tutorId,
  });

  const reviewsQ = useQuery<ReviewsAggregate>({
    queryKey: [`/reviews/tutor/${tutorId}`],
    enabled: !!tutorId,
  });

  const { map: appMap, isLoading: appsLoading } = useActiveApplicationByTutor();
  const existingStatus = appMap.get(tutorId);

  const t = tutorQ.data;
  const initials = (t?.user.name ?? '')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={GraduationCap}
        title='Detail Tutor'
        description='Tinjau profil sebelum mengajukan belajar.'
      />
      {tutorQ.isLoading || !t ? (
        <Skeleton className='h-60 w-full' />
      ) : (
        <Card className='hover:shadow-primary-500/5 transition-shadow hover:shadow-md'>
          <CardContent className='space-y-5 pt-6'>
            <div className='flex items-start gap-4'>
              <Avatar className='ring-primary-100 size-16 ring-2'>
                <AvatarFallback className='from-primary-400 to-primary-600 bg-gradient-to-br font-bold text-white'>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className='min-w-0 flex-1'>
                <h2 className='h3'>{t.user.name}</h2>
                <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                  <Star className='size-3.5 fill-amber-400 text-amber-400' />
                  <span className='mono'>
                    {(reviewsQ.data?.average ?? 0).toFixed(1)}
                  </span>
                  <span>({reviewsQ.data?.total ?? 0} ulasan)</span>
                </div>
              </div>
              <div className='text-right'>
                <div className='mono text-primary-900 text-xl font-bold'>
                  {t.hourlyRate ? formatRupiah(t.hourlyRate) : '—'}
                </div>
                <div className='text-muted-foreground text-xs'>per jam</div>
              </div>
            </div>

            {t.bio ? <p className='text-sm leading-relaxed'>{t.bio}</p> : null}

            <div className='grid gap-4 sm:grid-cols-2'>
              <Section
                title='Mata Pelajaran'
                items={subjectLabels(t.subjects)}
              />
              <Section
                title='Jenjang'
                items={educationLevelLabels(t.educationLevels)}
              />
              <Section
                title='Metode Mengajar'
                items={teachingMethodLabels(t.teachingMethods)}
              />
              <Section
                title='Pengalaman'
                text={
                  t.experience
                    ? `${t.experience} tahun`
                    : (t.educationBackground ?? '—')
                }
              />
            </div>

            {existingStatus ? (
              <div className='border-primary-100 bg-primary-50/50 flex flex-col gap-1 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between'>
                <div className='text-sm'>
                  <div className='font-semibold'>
                    {existingStatus === 'ACCEPTED'
                      ? 'Sudah diterima oleh tutor'
                      : 'Aplikasi sedang ditinjau'}
                  </div>
                  <div className='text-muted-foreground text-xs'>
                    {existingStatus === 'ACCEPTED'
                      ? 'Lanjut ke Pesan Sesi untuk menjadwalkan.'
                      : 'Tunggu tutor menerima aplikasi Anda.'}
                  </div>
                </div>
                <Badge
                  variant='secondary'
                  className={
                    existingStatus === 'ACCEPTED'
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-primary-200 bg-primary-100 text-primary-800 border'
                  }
                >
                  {existingStatus === 'ACCEPTED' ? 'Diterima' : 'Menunggu'}
                </Badge>
              </div>
            ) : (
              <Button
                size='lg'
                onClick={() => setOpen(true)}
                className='w-full sm:w-auto'
                disabled={appsLoading}
              >
                Ajukan Belajar
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <ApplyDialog
        open={open}
        onOpenChange={setOpen}
        tutorId={tutorId}
        tutorName={t?.user.name}
      />
    </div>
  );
}

function Section({
  title,
  items,
  text,
}: {
  title: string;
  items?: string[];
  text?: string;
}) {
  return (
    <div>
      <div className='text-muted-foreground mb-1.5 text-xs font-semibold tracking-wide uppercase'>
        {title}
      </div>
      {items ? (
        <div className='flex flex-wrap gap-1.5'>
          {items.length ? (
            items.map((i) => (
              <Badge
                key={i}
                className='bg-primary-50 text-primary-700 border-primary-100 border'
              >
                {i}
              </Badge>
            ))
          ) : (
            <span className='text-muted-foreground text-xs'>—</span>
          )}
        </div>
      ) : (
        <div className='text-sm'>{text}</div>
      )}
    </div>
  );
}
