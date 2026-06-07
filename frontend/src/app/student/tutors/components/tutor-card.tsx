import Link from 'next/link';
import { Star } from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatRupiah } from '@/lib/format';

import type { TutorSearchItem } from '../types';

export function TutorCard({ tutor }: { tutor: TutorSearchItem }) {
  const initials = tutor.user.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Card>
      <CardHeader className='flex flex-row items-center gap-3 space-y-0'>
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2'>
            <h3 className='truncate font-semibold'>{tutor.user.name}</h3>
            {tutor.featured ? (
              <Badge className='bg-amber-100 text-amber-800'>Featured</Badge>
            ) : null}
          </div>
          <div className='text-muted-foreground flex items-center gap-1 text-xs'>
            <Star className='size-3 fill-amber-400 text-amber-400' />
            <span>
              {tutor.averageRating.toFixed(1)} ({tutor.reviewCount})
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-2 text-sm'>
        <p className='text-muted-foreground line-clamp-2 min-h-[2.5rem]'>
          {tutor.bio ?? 'Belum ada bio'}
        </p>
        <div className='flex flex-wrap gap-1'>
          {tutor.subjects.slice(0, 3).map((s) => (
            <Badge key={s} variant='secondary'>
              {s}
            </Badge>
          ))}
        </div>
        <div className='flex items-center justify-between pt-2'>
          <div className='text-sm font-semibold'>
            {tutor.hourlyRate
              ? `${formatRupiah(tutor.hourlyRate)}/jam`
              : 'Tarif belum diatur'}
          </div>
          <Link href={`/student/tutors/${tutor.id}`}>
            <Button size='sm'>Lihat</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
