'use client';

import * as React from 'react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { usePagination } from '@/hooks/use-pagination';
import { useDebounce } from '@/hooks/use-debounce';

import { TutorCard } from './components/tutor-card';
import { useTutorSearch } from './hooks/query';
import { useActiveApplicationByTutor } from './hooks/use-my-applications';
import type { TutorSearchFilters } from './types';

export default function StudentTutorsPage() {
  const { params, setParams } = usePagination({ defaultPerPage: 12 });
  const [search, setSearch] = React.useState(params.search);
  const debounced = useDebounce(search, 400);

  React.useEffect(() => {
    if (debounced !== params.search) {
      setParams({ search: debounced, page: 1 });
    }
  }, [debounced, params.search, setParams]);

  const filters: TutorSearchFilters = { name: params.search || undefined };
  const { data, isLoading } = useTutorSearch(filters, params);
  const { map: appMap } = useActiveApplicationByTutor();
  const tutors = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h1 className='h2'>Cari Tutor</h1>
        <span className='text-muted-foreground text-sm'>
          {meta?.count ?? 0} tutor
        </span>
      </div>

      <Input
        placeholder='Cari nama tutor...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className='max-w-md'
      />

      {isLoading ? (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className='h-52 rounded-lg' />
          ))}
        </div>
      ) : tutors.length === 0 ? (
        <div className='text-muted-foreground rounded-md border py-12 text-center text-sm'>
          Tidak ada tutor sesuai filter.
        </div>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {tutors.map((t) => (
            <TutorCard
              key={t.id}
              tutor={t}
              applicationStatus={appMap.get(t.id)}
            />
          ))}
        </div>
      )}

      {meta && meta.max_page > 1 ? (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  setParams({ page: Math.max(1, params.page - 1) })
                }
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink isActive>{params.page}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setParams({
                    page: Math.min(meta.max_page, params.page + 1),
                  })
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  );
}
