'use client';

import { CheckCircle2, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';

import type { CompletenessResponse, TutorProfile } from '../types';
import { usePublish, useUnpublish } from '../hooks/mutation';

interface Props {
  profile: TutorProfile | undefined;
  completeness: CompletenessResponse | undefined;
}

export function PublishGate({ profile, completeness }: Props) {
  const publish = usePublish();
  const unpublish = useUnpublish();

  if (!profile) return null;

  const verified = profile.verificationStatus === 'VERIFIED';
  const reachedScore =
    completeness !== undefined &&
    completeness.score >= completeness.minRequired;
  const isPublished = !!profile.publishedAt;
  const canPublish = verified && reachedScore && !isPublished;

  return (
    <div className='border-primary-100 mt-4 space-y-3 border-t pt-4'>
      <div className='flex items-center justify-between gap-3'>
        <h3 className='text-sm font-semibold'>Status Publikasi</h3>
        <StatusBadge kind='verification' status={profile.verificationStatus} />
      </div>
      <p className='text-muted-foreground text-xs'>
        {isPublished
          ? 'Profil Anda terlihat di pencarian siswa.'
          : 'Profil Anda belum publik. Lengkapi syarat berikut untuk publikasi.'}
      </p>
      <ul className='space-y-2 text-sm'>
        <li className='flex items-center gap-2'>
          {verified ? (
            <CheckCircle2 className='size-4 shrink-0 text-emerald-600' />
          ) : (
            <XCircle className='text-muted-foreground size-4 shrink-0' />
          )}
          Akun terverifikasi oleh admin
        </li>
        <li className='flex items-center gap-2'>
          {reachedScore ? (
            <CheckCircle2 className='size-4 shrink-0 text-emerald-600' />
          ) : (
            <XCircle className='text-muted-foreground size-4 shrink-0' />
          )}
          Kelengkapan profil minimum {completeness?.minRequired ?? 80}%
        </li>
      </ul>
      <div className='pt-1'>
        {isPublished ? (
          <Button
            variant='outline'
            size='sm'
            className='w-full'
            onClick={() => unpublish.mutate()}
            disabled={unpublish.isPending}
          >
            {unpublish.isPending ? 'Memproses...' : 'Sembunyikan'}
          </Button>
        ) : (
          <Button
            size='sm'
            className='w-full'
            onClick={() => publish.mutate()}
            disabled={!canPublish || publish.isPending}
          >
            {publish.isPending ? 'Memproses...' : 'Publikasikan'}
          </Button>
        )}
      </div>
    </div>
  );
}
