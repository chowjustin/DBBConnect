import Link from 'next/link';
import { ShieldCheck, Star } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatRupiah } from '@/lib/format';
import { subjectLabel } from '@/constant/enums';

import type { TutorSearchItem } from '../types';
import type { ApplicationStatus } from '../hooks/use-my-applications';

export function TutorCard({
  tutor,
  applicationStatus,
}: {
  tutor: TutorSearchItem;
  applicationStatus?: ApplicationStatus;
}) {
  const initials = tutor.user.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Link
      href={`/student/tutors/${tutor.id}`}
      className='group border-primary-100 hover:border-primary-300 hover:shadow-primary-500/5 focus-visible:ring-primary-400 relative block overflow-hidden rounded-xl border bg-white p-5 transition-all hover:shadow-md focus-visible:ring-2 focus-visible:outline-none'
    >
      <div className='absolute top-3 right-3 flex flex-wrap items-center justify-end gap-1.5'>
        {applicationStatus ? (
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase ${
              applicationStatus === 'ACCEPTED'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-primary-200 bg-primary-50 text-primary-800'
            }`}
          >
            {applicationStatus === 'ACCEPTED' ? 'Diterima' : 'Sudah diajukan'}
          </span>
        ) : null}
        {tutor.featured ? (
          <span className='bg-secondary-100 text-secondary-800 border-secondary-200 rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase'>
            Featured
          </span>
        ) : null}
      </div>

      <div className='flex gap-4'>
        <Avatar className='ring-primary-100 size-16 shrink-0 ring-2'>
          <AvatarFallback className='from-primary-400 to-primary-600 bg-gradient-to-br font-bold text-white'>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className='min-w-0 flex-1'>
          <div className='flex items-start gap-2'>
            <h3 className='text-foreground truncate font-semibold'>
              {tutor.user.name}
            </h3>
            <ShieldCheck
              className='size-4 shrink-0 text-emerald-600'
              aria-label='Terverifikasi'
            />
          </div>
          <p className='text-muted-foreground mt-0.5 line-clamp-1 text-sm'>
            {tutor.bio ?? 'Belum ada bio.'}
          </p>
          <div className='mono text-muted-foreground mt-2 flex items-center gap-2 text-xs tabular-nums'>
            <span className='inline-flex items-center gap-1'>
              <Star className='size-3 fill-amber-400 text-amber-400' />
              {tutor.averageRating.toFixed(1)}{' '}
              <span className='text-muted-foreground/60'>
                ({tutor.reviewCount})
              </span>
            </span>
            <span aria-hidden>·</span>
            <span className='text-foreground font-medium'>
              {tutor.hourlyRate
                ? `${formatRupiah(tutor.hourlyRate)}/jam`
                : 'Tarif belum diatur'}
            </span>
          </div>
        </div>
      </div>

      <div className='mt-4 flex flex-wrap gap-1.5'>
        {tutor.subjects.slice(0, 4).map((s) => (
          <span
            key={s}
            className='bg-primary-50 text-primary-800 border-primary-100 rounded-full border px-2 py-0.5 text-xs'
          >
            {subjectLabel(s)}
          </span>
        ))}
        {tutor.subjects.length > 4 ? (
          <span className='text-muted-foreground self-center text-xs'>
            +{tutor.subjects.length - 4}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
