'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/form/text-field';
import withAuth from '@/components/with-auth';
import useAuthStore from '@/store/use-auth-store';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';

import { useLogin } from './hooks/mutation';
import { loginFormSchema } from './schema';
import type { LoginForm, LoginRequest } from './types';

function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const login = useAuthStore.useLogin();

  const methods = useForm<LoginForm>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  });

  const { mutateAsync, isPending } = useLogin();

  const onSubmit = methods.handleSubmit(async (values) => {
    const req: LoginRequest = {
      email: values.email,
      password: values.password,
    };
    try {
      const res = await mutateAsync(req);
      login({
        ...res.user,
        phoneNumber: '',
        emailVerifiedAt: null,
        referralCode: null,
        referredById: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      notifySuccess('Login berhasil');
      const redirectParam =
        sp.get('redirect') ??
        (typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('redirect')
          : null);
      const target =
        redirectParam ??
        (res.user.role === 'TUTOR'
          ? '/tutor'
          : res.user.role === 'STUDENT'
            ? '/student'
            : '/admin');
      router.replace(target);
    } catch (err) {
      notifyAxiosError(err, 'Login gagal');
    }
  });

  return (
    <div className='space-y-8'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-semibold tracking-[-0.025em] md:text-4xl'>
          Selamat datang kembali.
        </h1>
        <p className='text-muted-foreground text-sm'>
          Belum punya akun?{' '}
          <Link
            href='/auth/register'
            className='text-primary-700 hover:text-primary-900 font-medium underline-offset-4 hover:underline'
          >
            Daftar gratis
          </Link>
        </p>
      </div>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit} className='space-y-5'>
          <TextField<LoginForm>
            name='email'
            label='Email'
            type='email'
            autoComplete='email'
            placeholder='you@example.com'
          />
          <div className='space-y-1.5'>
            <TextField<LoginForm>
              name='password'
              label='Password'
              type='password'
              autoComplete='current-password'
              placeholder='••••••••'
            />
            <div className='text-right'>
              <Link
                href='/auth/forgot'
                className='text-muted-foreground hover:text-foreground text-xs'
              >
                Lupa password?
              </Link>
            </div>
          </div>
          <Button
            type='submit'
            size='lg'
            className='w-full gap-1.5'
            disabled={isPending}
          >
            {isPending ? 'Memuat...' : 'Masuk'}
          </Button>
        </form>
      </FormProvider>
      <p className='text-muted-foreground text-center text-xs'>
        Dengan masuk, Anda menyetujui{' '}
        <Link
          href='/legal/terms'
          className='hover:text-foreground underline-offset-4 hover:underline'
        >
          Syarat Layanan
        </Link>{' '}
        dan{' '}
        <Link
          href='/legal/privacy'
          className='hover:text-foreground underline-offset-4 hover:underline'
        >
          Kebijakan Privasi
        </Link>
        .
      </p>
    </div>
  );
}

export default withAuth(LoginPage, 'public');
