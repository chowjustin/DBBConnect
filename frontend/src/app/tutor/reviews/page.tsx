'use client';

import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';

import api from '@/lib/api';
import useAuthStore from '@/store/use-auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateId } from '@/lib/format';

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  student: { user: { name: string } };
}

interface TutorReviewsResponse {
  total: number;
  average: number;
  distribution: Record<string, number>;
  recent: ReviewItem[];
  viewerReviewed: boolean;
}

export default function TutorReviewsPage() {
  const user = useAuthStore.useUser();

  const { data, isLoading } = useQuery<TutorReviewsResponse>({
    queryKey: [`/reviews/tutor/${user?.id}`],
    enabled: !!user?.id,
  });

  return (
    <div className='space-y-4'>
      <h1 className='h2'>Ulasan</h1>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Star className='size-5 fill-amber-400 text-amber-400' />
            {isLoading
              ? '—'
              : `${(data?.average ?? 0).toFixed(1)} (${data?.total ?? 0})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className='h-20 w-full' />
          ) : (
            <div className='space-y-1 text-sm'>
              {[5, 4, 3, 2, 1].map((n) => (
                <div key={n} className='flex items-center gap-2'>
                  <span className='w-4'>{n}</span>
                  <div className='bg-muted h-2 flex-1 rounded'>
                    <div
                      className='bg-primary h-2 rounded'
                      style={{
                        width: `${(data?.distribution?.[n] ?? 0) / Math.max(1, data?.total ?? 1) * 100}%`,
                      }}
                    />
                  </div>
                  <span className='text-muted-foreground text-xs'>
                    {data?.distribution?.[n] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className='space-y-3'>
        {data?.recent.map((r) => (
          <Card key={r.id}>
            <CardContent className='space-y-1 pt-4'>
              <div className='flex items-center justify-between'>
                <div className='font-semibold'>{r.student.user.name}</div>
                <div className='flex items-center gap-1 text-sm'>
                  <Star className='size-4 fill-amber-400 text-amber-400' />
                  {r.rating}
                </div>
              </div>
              <p className='text-sm'>{r.comment ?? '—'}</p>
              <p className='text-muted-foreground text-xs'>
                {formatDateId(r.createdAt)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
