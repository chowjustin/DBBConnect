'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { Dropzone } from '@/components/form/dropzone-field';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';
import { uploadFile, type UploadResult } from '@/lib/upload';
import { useTutorProfile } from '@/app/tutor/profile/hooks/query';

function useUploadDoc() {
  return useMutation({
    mutationFn: (file: File) => uploadFile(file, 'verification'),
    onError: (e) => notifyAxiosError(e, 'Gagal mengunggah dokumen'),
  });
}

export default function TutorVerificationPage() {
  const qc = useQueryClient();
  const profileQ = useTutorProfile();
  const uploadDoc = useUploadDoc();
  const [idDoc, setIdDoc] = React.useState<UploadResult | null>(null);
  const [eduDoc, setEduDoc] = React.useState<UploadResult | null>(null);
  const [lightbox, setLightbox] = React.useState<string | null>(null);

  const submit = useMutation({
    mutationFn: async () => {
      if (!idDoc || !eduDoc) throw new Error('Unggah kedua dokumen');
      const res = await api.post('/tutors/verification', {
        idDocumentUrl: idDoc.file_url,
        educationProofUrl: eduDoc.file_url,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/tutors/profile'] });
      notifySuccess('Pengajuan verifikasi terkirim');
      setIdDoc(null);
      setEduDoc(null);
    },
    onError: (e) => notifyAxiosError(e),
  });

  const profile = profileQ.data?.profile;

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={ShieldCheck}
        title='Verifikasi Akun'
        description='Unggah KTP dan ijazah untuk diverifikasi admin.'
      />

      {profileQ.isLoading || !profile ? (
        <Skeleton className='h-32 w-full' />
      ) : (
        <Card className='hover:shadow-primary-500/5 transition-shadow hover:shadow-md'>
          <CardHeader>
            <CardTitle className='flex items-center gap-3'>
              Status
              <StatusBadge
                kind='verification'
                status={profile.verificationStatus}
              />
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {profile.verificationStatus === 'VERIFIED' ? (
              <p className='text-sm text-emerald-700'>
                Akun Anda terverifikasi pada{' '}
                {profile.verifiedAt
                  ? new Date(profile.verifiedAt).toLocaleDateString('id-ID')
                  : '-'}
                . Anda dapat mempublikasikan profil.
              </p>
            ) : profile.verificationStatus === 'PENDING' &&
              profile.idDocumentUrl ? (
              <p className='text-muted-foreground text-sm'>
                Pengajuan Anda sedang ditinjau. Anda akan menerima notifikasi
                setelah keputusan dibuat.
              </p>
            ) : (
              <div className='grid gap-4 sm:grid-cols-2'>
                <DocSlot
                  label='Dokumen Identitas (KTP)'
                  doc={idDoc}
                  onPick={(f) => uploadDoc.mutate(f, { onSuccess: setIdDoc })}
                  onClear={() => setIdDoc(null)}
                  onPreview={(url) => setLightbox(url)}
                  uploading={uploadDoc.isPending}
                />
                <DocSlot
                  label='Bukti Pendidikan (Ijazah)'
                  doc={eduDoc}
                  onPick={(f) => uploadDoc.mutate(f, { onSuccess: setEduDoc })}
                  onClear={() => setEduDoc(null)}
                  onPreview={(url) => setLightbox(url)}
                  uploading={uploadDoc.isPending}
                />
              </div>
            )}

            {profile.verificationStatus !== 'VERIFIED' &&
            !(
              profile.verificationStatus === 'PENDING' && profile.idDocumentUrl
            ) ? (
              <Button
                onClick={() => submit.mutate()}
                disabled={!idDoc || !eduDoc || submit.isPending}
              >
                {submit.isPending ? 'Mengirim...' : 'Kirim untuk Diverifikasi'}
              </Button>
            ) : null}

            {profile.verificationStatus === 'REJECTED' ? (
              <Button
                variant='outline'
                onClick={() =>
                  qc.invalidateQueries({ queryKey: ['/tutors/profile'] })
                }
              >
                Ajukan Ulang
              </Button>
            ) : null}
          </CardContent>
        </Card>
      )}

      <ImageLightbox
        open={!!lightbox}
        onClose={() => setLightbox(null)}
        slides={lightbox ? [{ src: lightbox }] : []}
      />
    </div>
  );
}

function DocSlot({
  label,
  doc,
  onPick,
  onClear,
  onPreview,
  uploading,
}: {
  label: string;
  doc: UploadResult | null;
  onPick: (f: File) => void;
  onClear: () => void;
  onPreview: (url: string) => void;
  uploading: boolean;
}) {
  return (
    <div className='space-y-1.5'>
      <div className='text-sm font-medium'>{label}</div>
      {doc ? (
        <div className='border-primary-200 bg-primary-50/30 flex items-center gap-3 rounded-lg border p-3'>
          <button
            type='button'
            onClick={() => onPreview(doc.file_url)}
            className='border-primary-200 size-14 shrink-0 overflow-hidden rounded-md border bg-white'
          >
            <img
              src={doc.file_url}
              alt={label}
              className='size-full object-cover'
            />
          </button>
          <div className='min-w-0 flex-1 truncate text-xs'>
            {doc.path.split('/').pop()}
          </div>
          <Button
            variant='ghost'
            size='icon-sm'
            aria-label='Hapus dokumen'
            onClick={onClear}
          >
            ✕
          </Button>
        </div>
      ) : (
        <div className='relative'>
          <Dropzone
            value={null}
            onChange={(f) => {
              if (f) onPick(f);
            }}
            accept='.pdf,.png,.jpg,.jpeg'
            maxSizeMB={5}
          />
          {uploading ? (
            <div className='bg-primary-50/80 text-primary-700 absolute inset-0 flex items-center justify-center rounded-lg text-sm font-medium backdrop-blur-sm'>
              Mengunggah...
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
