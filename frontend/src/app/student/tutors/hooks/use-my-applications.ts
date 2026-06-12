'use client';

import { useQuery } from '@tanstack/react-query';
import * as React from 'react';

import api from '@/lib/api';

export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

interface MyApplication {
  id: string;
  tutorId: string;
  status: ApplicationStatus;
}

const QUERY_KEY = ['/applications/student', { per_page: 50 }] as const;

export function useMyApplications() {
  return useQuery<{ data: MyApplication[] }>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await api.get('/applications/student', {
        params: { per_page: 50 },
      });
      return res.data;
    },
    staleTime: 30_000,
  });
}

/**
 * Map of tutorId -> active application status (PENDING | ACCEPTED).
 * Rejected applications are excluded so the student can re-apply.
 */
export function useActiveApplicationByTutor() {
  const q = useMyApplications();
  const map = React.useMemo(() => {
    const m = new Map<string, ApplicationStatus>();
    for (const a of q.data?.data ?? []) {
      if (a.status === 'PENDING' || a.status === 'ACCEPTED') {
        m.set(a.tutorId, a.status);
      }
    }
    return m;
  }, [q.data]);
  return { map, isLoading: q.isLoading };
}
