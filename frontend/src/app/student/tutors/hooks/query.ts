'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import api from '@/lib/api';
import type { PaginatedApiResponse, PaginationQuery } from '@/types/api';

import type { TutorSearchFilters, TutorSearchItem } from '../types';

export function useTutorSearch(
  filters: TutorSearchFilters,
  pagination: PaginationQuery,
) {
  return useQuery<{
    data: TutorSearchItem[];
    meta: PaginatedApiResponse<TutorSearchItem[]>['meta'];
  }>({
    queryKey: ['/tutors/search', { ...filters, ...pagination }],
    queryFn: async () => {
      const res = await api.get('/tutors/search', {
        params: { ...filters, ...pagination },
      });
      return res.data;
    },
    placeholderData: keepPreviousData,
  });
}
