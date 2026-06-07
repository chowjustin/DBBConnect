'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';

interface BankRow {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  isActive: boolean;
  notes: string | null;
}

export default function AdminPlatformBankPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<BankRow[]>({
    queryKey: ['/admin/platform-bank'],
  });

  const [form, setForm] = React.useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    notes: '',
  });

  const create = useMutation({
    mutationFn: async (body: typeof form) => {
      const res = await api.post('/admin/platform-bank', body);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/admin/platform-bank'] });
      notifySuccess('Rekening ditambahkan');
      setForm({ bankName: '', accountNumber: '', accountHolder: '', notes: '' });
    },
    onError: (e) => notifyAxiosError(e),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await api.patch(`/admin/platform-bank/${id}`, { isActive });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/admin/platform-bank'] });
    },
    onError: (e) => notifyAxiosError(e),
  });

  return (
    <div className='space-y-4'>
      <h1 className='h2'>Rekening Platform</h1>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Rekening</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-3 sm:grid-cols-2'>
          <div className='space-y-1.5'>
            <Label>Nama Bank</Label>
            <Input
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
            />
          </div>
          <div className='space-y-1.5'>
            <Label>No Rekening</Label>
            <Input
              value={form.accountNumber}
              onChange={(e) =>
                setForm({ ...form, accountNumber: e.target.value })
              }
            />
          </div>
          <div className='space-y-1.5'>
            <Label>Atas Nama</Label>
            <Input
              value={form.accountHolder}
              onChange={(e) =>
                setForm({ ...form, accountHolder: e.target.value })
              }
            />
          </div>
          <div className='space-y-1.5'>
            <Label>Catatan</Label>
            <Input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className='sm:col-span-2'>
            <Button
              onClick={() => create.mutate(form)}
              disabled={create.isPending || !form.bankName}
            >
              Tambah
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Rekening</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          {isLoading ? (
            <Skeleton className='h-40 w-full' />
          ) : (
            (data ?? []).map((b) => (
              <div
                key={b.id}
                className='flex items-center justify-between rounded-md border p-3'
              >
                <div>
                  <div className='font-semibold'>{b.bankName}</div>
                  <div className='text-muted-foreground text-xs'>
                    {b.accountNumber} a.n. {b.accountHolder}
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Label className='text-xs'>Aktif</Label>
                  <Switch
                    checked={b.isActive}
                    onCheckedChange={(v) =>
                      toggle.mutate({ id: b.id, isActive: v })
                    }
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
