'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { GraduationCap, Star } from 'lucide-react';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PageHeader } from '@/components/ui/page-header';
import { formatRupiah } from '@/lib/format';

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
    queryKey: [`/tutors/${tutorId}`],
    enabled: !!tutorId,
  });

  const reviewsQ = useQuery<ReviewsAggregate>({
    queryKey: [`/reviews/tutor/${tutorId}`],
    enabled: !!tutorId,
  });

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
        <Card className='hover:shadow-md hover:shadow-primary-500/5 transition-shadow'>
          <CardContent className='space-y-5 pt-6'>
            <div className='flex items-start gap-4'>
              <Avatar className='size-16 ring-2 ring-primary-100'>
                <AvatarFallback className='bg-gradient-to-br from-primary-400 to-primary-600 text-white font-bold'>
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
                <div className='mono text-xl font-bold text-primary-900'>
                  {t.hourlyRate ? formatRupiah(t.hourlyRate) : '—'}
                </div>
                <div className='text-muted-foreground text-xs'>per jam</div>
              </div>
            </div>

            {t.bio ? (
              <p className='text-sm leading-relaxed'>{t.bio}</p>
            ) : null}

            <div className='grid gap-4 sm:grid-cols-2'>
              <Section title='Mata Pelajaran' items={t.subjects} />
              <Section title='Jenjang' items={t.educationLevels} />
              <Section title='Metode Mengajar' items={t.teachingMethods} />
              <Section
                title='Pengalaman'
                text={
                  t.experience
                    ? `${t.experience} tahun`
                    : t.educationBackground ?? '—'
                }
              />
            </div>

            <Button
              size='lg'
              onClick={() => setOpen(true)}
              className='w-full sm:w-auto'
            >
              Ajukan Belajar
            </Button>
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
      <div className='text-muted-foreground text-xs uppercase tracking-wide font-semibold mb-1.5'>
        {title}
      </div>
      {items ? (
        <div className='flex flex-wrap gap-1.5'>
          {items.length ? (
            items.map((i) => (
              <Badge
                key={i}
                className='bg-primary-50 text-primary-700 border border-primary-100'
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
