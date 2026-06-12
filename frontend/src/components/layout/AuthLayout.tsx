import { CheckCircle2, PiggyBank, ShieldCheck, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: 'Tutor terverifikasi',
    body: 'KTP + ijazah ditinjau admin sebelum profil publik.',
  },
  {
    icon: PiggyBank,
    title: 'Bayar transparan',
    body: 'Dana ditahan sampai sesi mulai, refund otomatis bila dibatalkan.',
  },
  {
    icon: Sparkles,
    title: 'Gratis untuk mulai',
    body: 'Browsing dan ajukan aplikasi tanpa biaya pendaftaran.',
  },
];

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='grid min-h-screen md:grid-cols-2'>
      {/* Brand panel (hidden on mobile) — light tinted */}
      <aside className='from-primary-50 via-secondary-50/40 to-primary-100/60 relative hidden overflow-hidden bg-gradient-to-br md:flex md:flex-col md:justify-between md:p-10 lg:p-14'>
        {/* Texture */}
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0 opacity-[0.05]'
          style={{
            backgroundImage:
              'radial-gradient(oklch(0.36 0.144 278) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Soft glows */}
        <div
          aria-hidden
          className='pointer-events-none absolute -top-32 -right-32 size-[30rem] rounded-full opacity-50 blur-3xl'
          style={{
            background:
              'radial-gradient(circle at center, oklch(0.85 0.12 188 / 0.5), transparent 60%)',
          }}
        />
        <div
          aria-hidden
          className='pointer-events-none absolute -bottom-40 -left-32 size-[34rem] rounded-full opacity-50 blur-3xl'
          style={{
            background:
              'radial-gradient(circle at center, oklch(0.85 0.1 277 / 0.5), transparent 60%)',
          }}
        />

        {/* Logo */}
        <Link
          href='/'
          className='text-foreground relative inline-flex items-center gap-2 text-base font-semibold'
        >
          <Image
            src='/logo-tutorconnect.png'
            alt='TutorConnect Logo'
            width={32}
            height={32}
          />
          TutorConnect
        </Link>

        {/* Single focused moment: headline + 3 trust points */}
        <div className='relative max-w-md'>
          <h2 className='text-foreground text-3xl leading-tight font-semibold tracking-[-0.025em] text-balance lg:text-4xl'>
            Marketplace tutor Indonesia yang{' '}
            <span className='text-primary-700 italic'>benar-benar aman.</span>
          </h2>
          <ul className='mt-10 space-y-5'>
            {TRUST_POINTS.map((t) => (
              <li key={t.title} className='flex gap-3'>
                <div className='border-primary-200 text-primary-700 mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border bg-white shadow-sm'>
                  <t.icon className='size-4' strokeWidth={2} />
                </div>
                <div>
                  <p className='text-foreground text-sm font-semibold'>
                    {t.title}
                  </p>
                  <p className='text-muted-foreground mt-0.5 text-sm'>
                    {t.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Single micro-stat at bottom */}
        <p className='text-muted-foreground relative text-xs'>
          <span className='mono text-foreground font-semibold tabular-nums'>
            127+
          </span>{' '}
          tutor aktif di 12 mata pelajaran
        </p>
      </aside>

      {/* Form panel */}
      <main className='relative flex flex-col bg-white'>
        {/* Mobile-only minimal header w/ logo */}
        <div className='border-primary-100 flex items-center justify-between border-b px-6 py-4 md:hidden'>
          <Link
            href='/'
            className='inline-flex items-center gap-2 text-base font-semibold'
          >
            <Image
              src='/logo-tutorconnect.png'
              alt='TutorConnect Logo'
              width={32}
              height={32}
            />
            TutorConnect
          </Link>
        </div>

        {/* Desktop top-right helper */}
        <div className='hidden justify-end px-10 pt-8 md:flex lg:px-14'>
          <Link
            href='/'
            className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm'
          >
            <CheckCircle2 className='size-3.5' />
            Lewati ke beranda
          </Link>
        </div>

        <div className='flex flex-1 items-center justify-center px-6 py-10 sm:px-8'>
          <div className='w-full max-w-md'>{children}</div>
        </div>

        <footer className='text-muted-foreground px-6 py-6 text-center text-xs sm:px-8'>
          © {new Date().getFullYear()} TutorConnect · Marketplace tutor
          Indonesia
        </footer>
      </main>
    </div>
  );
}
