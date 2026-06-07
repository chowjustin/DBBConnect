'use client';

import { useQuery } from '@tanstack/react-query';

import api from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { formatDateId } from '@/lib/format';
import { usePagination } from '@/hooks/use-pagination';
import type { PaginatedApiResponse } from '@/types/api';
import type { User } from '@/types/shared';
import * as React from 'react';
import { useDebounce } from '@/hooks/use-debounce';

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
            {data?.data.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Badge variant='secondary'>{u.role}</Badge>
                </TableCell>
                <TableCell>{formatDateId(u.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
