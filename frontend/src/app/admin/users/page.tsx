'use client';

import { useQuery } from '@tanstack/react-query';

import api from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { formatDateId } from '@/lib/format';
import { roleLabel } from '@/constant/enums';
import { usePagination } from '@/hooks/use-pagination';
import type { PaginatedApiResponse } from '@/types/api';
import type { Role, User } from '@/types/shared';
import * as React from 'react';
import { useDebounce } from '@/hooks/use-debounce';

const ROLE_BADGE: Record<Role, string> = {
  ADMIN: 'border-rose-200 bg-rose-50 text-rose-700',
  TUTOR: 'border-primary-200 bg-primary-50 text-primary-800',
  STUDENT: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

export default function AdminUsersPage() {
  const { params, setParams } = usePagination();
  const [search, setSearch] = React.useState(params.search);
  const debounced = useDebounce(search, 400);

  React.useEffect(() => {
    if (debounced !== params.search) setParams({ search: debounced, page: 1 });
  }, [debounced, params.search, setParams]);

  const { data, isLoading } = useQuery<{
    data: User[];
    meta: PaginatedApiResponse<User[]>['meta'];
  }>({
    queryKey: ['/users', params],
    queryFn: async () => {
      const res = await api.get('/users', { params });
      return res.data;
    },
  });

  return (
    <div className='space-y-4'>
      <h1 className='h2'>Pengguna</h1>
      <Input
        placeholder='Cari email atau nama...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className='max-w-md'
      />

      {isLoading ? (
        <Skeleton className='h-40 w-full' />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Daftar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.length === 0 ? (
              <TableEmpty colSpan={4}>Tidak ada pengguna.</TableEmpty>
            ) : (
              data?.data.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant='secondary'
                      className={`border ${ROLE_BADGE[u.role]}`}
                    >
                      {roleLabel(u.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDateId(u.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
