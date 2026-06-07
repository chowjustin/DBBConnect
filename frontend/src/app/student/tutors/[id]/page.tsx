'use client';

import { useParams } from 'next/navigation';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useApply } from './hooks/mutation';
import { notifyError } from '@/lib/toast';

export default function StudentTutorDetailPage() {
  const params = useParams<{ id: string }>();
  const tutorId = params.id;
  const [message, setMessage] = React.useState('');
  const apply = useApply();

  const onApply = () => {
    if (message.length > 500) {
      notifyError('Pesan maks 500 karakter');
      return;
    }
    apply.mutate({ tutorId, message: message || undefined });
  };

  return (
    <div className='space-y-4'>
      <h1 className='h2'>Detail Tutor</h1>
      <Card>
        <CardHeader>
          <CardTitle>Lamar Tutor</CardTitle>
          <CardDescription>
            Pesan opsional, maksimum 500 karakter.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder='Jelaskan kebutuhan belajar Anda...'
          />
          <div className='text-muted-foreground text-right text-xs'>
            {message.length}/500
          </div>
          <Button onClick={onApply} disabled={apply.isPending}>
            {apply.isPending ? 'Mengirim...' : 'Kirim Aplikasi'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
