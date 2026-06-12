'use client';

import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  CheckCircle2,
  PiggyBank,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className='text-foreground flex min-h-screen flex-col bg-white'>
      <a
        href='#main'
        className='bg-primary-700 sr-only z-50 rounded px-3 py-2 text-sm text-white focus:not-sr-only focus:absolute focus:top-4 focus:left-4'
      >
        Lewati ke konten utama
      </a>
      <Header />
      <main id='main' className='flex-1'>
        <Hero />
        <TrustStrip />
        <Features />
        <Steps />
        <Pricing />
        <Testimonials />
        <FAQ />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className='border-primary-100/60 sticky top-0 z-10 border-b bg-white/85 backdrop-blur-xl'>
      <div className='layout flex items-center justify-between py-4'>
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
        <nav
          className='hidden items-center gap-7 text-sm md:flex'
          aria-label='Primary'
        >
          <a
            href='#fitur'
            className='text-muted-foreground hover:text-foreground'
          >
            Fitur
          </a>
          <a
            href='#cara'
            className='text-muted-foreground hover:text-foreground'
          >
            Cara kerja
          </a>
          <a
            href='#harga'
            className='text-muted-foreground hover:text-foreground'
          >
            Harga
          </a>
          <a
            href='#faq'
            className='text-muted-foreground hover:text-foreground'
          >
            FAQ
          </a>
        </nav>
        <div className='flex items-center gap-2'>
          <Link href='/auth/login'>
            <Button variant='ghost' size='sm'>
              Masuk
            </Button>
          </Link>
          <Link href='/auth/register'>
            <Button size='sm' className='gap-1'>
              Daftar <ArrowRight className='size-3.5' />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

const SUBJECT_QUICK = [
  'Matematika',
  'Fisika',
  'Inggris',
  'Kimia',
  'Ekonomi',
  'CS',
];

const HERO_TUTORS = [
  {
    initials: 'AR',
    name: 'Aulia Rahmadani',
    subject: 'Matematika SMA',
    city: 'Jakarta',
    rate: 'Rp120k',
    rating: 4.9,
    sessions: 124,
    avatar: 'from-primary-400 to-primary-600',
    highlighted: true,
  },
  {
    initials: 'BP',
    name: 'Bagus Pradana',
    subject: 'Fisika',
    city: 'Bandung',
    rate: 'Rp150k',
    rating: 4.8,
    sessions: 87,
    avatar: 'from-secondary-400 to-secondary-600',
  },
  {
    initials: 'CL',
    name: 'Citra Larasati',
    subject: 'Bahasa Inggris',
    city: 'Yogyakarta',
    rate: 'Rp100k',
    rating: 5.0,
    sessions: 63,
    avatar: 'from-amber-400 to-amber-600',
  },
];

function Hero() {
  const router = useRouter();
  const [q, setQ] = React.useState('');

  const submit = (subject?: string) => {
    const value = subject ?? q.trim();
    const params = value ? `?subject=${encodeURIComponent(value)}` : '';
    router.push(`/student/tutors${params}`);
  };

  return (
    <section className='relative overflow-hidden pt-10 pb-16 sm:pt-20 sm:pb-24 md:pt-28 md:pb-36'>
      {/* Layered radial backdrop, single source of warmth */}
      <div className='pointer-events-none absolute inset-0 -z-10'>
        <div
          className='absolute -top-32 left-1/3 size-[50rem] -translate-x-1/2 rounded-full opacity-70 blur-3xl'
          style={{
            background:
              'radial-gradient(circle at center, oklch(0.93 0.04 272 / 0.6), transparent 60%)',
          }}
        />
        <div
          className='absolute top-40 right-0 size-[35rem] rounded-full opacity-50 blur-3xl'
          style={{
            background:
              'radial-gradient(circle at center, oklch(0.92 0.06 188 / 0.5), transparent 65%)',
          }}
        />
        {/* Subtle grid */}
        <div
          className='absolute inset-0 opacity-[0.025]'
          style={{
            backgroundImage:
              'linear-gradient(oklch(0.36 0.144 278) 1px, transparent 1px), linear-gradient(90deg, oklch(0.36 0.144 278) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className='layout grid items-center gap-12 md:grid-cols-[1.15fr_1fr] md:gap-16'>
        <div className='max-w-2xl'>
          <div className='border-primary-200/70 bg-primary-50 mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium'>
            <span className='relative flex size-1.5'>
              <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60 opacity-75' />
              <span className='relative inline-flex size-1.5 rounded-full bg-emerald-500' />
            </span>
            <span className='text-primary-800'>
              Tutor merespons rata-rata dalam 4 jam
            </span>
          </div>

          <h1 className='text-foreground text-4xl leading-[0.95] font-semibold tracking-[-0.04em] text-balance sm:text-5xl sm:leading-[0.92] md:text-6xl lg:text-[5.5rem]'>
            Cari tutor yang
            <br />
            <span className='relative inline-block'>
              <span className='text-primary-700'>benar-benar cocok.</span>
              <svg
                aria-hidden
                className='text-primary-300 absolute -bottom-3 left-0 w-full'
                viewBox='0 0 300 12'
                preserveAspectRatio='none'
                fill='none'
              >
                <path
                  d='M2 8 Q 75 2 150 6 T 298 5'
                  stroke='currentColor'
                  strokeWidth='3'
                  strokeLinecap='round'
                />
              </svg>
            </span>
          </h1>

          <p className='text-muted-foreground mt-6 max-w-xl text-base text-pretty sm:mt-8 md:text-lg'>
            Pilih dari ratusan tutor terverifikasi di seluruh Indonesia. Bayar
            transparan, sesi dikonfirmasi admin sebelum dana dilepas.
          </p>

          {/* Search as the CTA */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className='border-primary-200/80 shadow-primary-500/5 focus-within:border-primary-400 focus-within:ring-primary-300/30 mt-8 flex max-w-xl items-stretch gap-2 rounded-2xl border bg-white p-2 shadow-lg focus-within:ring-4'
          >
            <label htmlFor='hero-search' className='sr-only'>
              Cari tutor berdasarkan mata pelajaran
            </label>
            <div className='text-muted-foreground flex items-center pl-3'>
              <Search className='size-4' />
            </div>
            <input
              id='hero-search'
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder='Mata pelajaran, misal: Matematika SMA'
              className='placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent px-2 text-sm outline-none'
            />
            <Button type='submit' size='default' className='shrink-0 gap-1'>
              Cari<span className='hidden sm:inline'> tutor</span>
              <ArrowRight className='size-3.5' />
            </Button>
          </form>
          <div className='mt-3 flex flex-wrap items-center gap-1.5'>
            <span className='text-muted-foreground mr-1 text-xs'>Populer:</span>
            {SUBJECT_QUICK.map((s) => (
              <button
                key={s}
                onClick={() => submit(s)}
                className='border-primary-100 hover:border-primary-300 hover:bg-primary-50 text-foreground cursor-pointer rounded-full border bg-white px-3 py-1 text-xs transition-colors'
              >
                {s}
              </button>
            ))}
          </div>

          {/* Social proof: avatar cluster + organic copy */}
          <div className='mt-10 flex items-center gap-4'>
            <div className='flex -space-x-2'>
              {['IA', 'RS', 'MK', 'NF'].map((s, i) => (
                <div
                  key={s}
                  className={`ring-background size-8 rounded-full ring-2 ${
                    [
                      'from-primary-400 to-primary-600 bg-gradient-to-br',
                      'from-secondary-400 to-secondary-600 bg-gradient-to-br',
                      'bg-gradient-to-br from-amber-400 to-amber-600',
                      'bg-gradient-to-br from-rose-400 to-rose-600',
                    ][i]
                  } flex items-center justify-center text-[10px] font-bold text-white`}
                >
                  {s}
                </div>
              ))}
            </div>
            <div className='text-muted-foreground text-xs leading-tight'>
              <p>
                <span className='text-foreground font-semibold'>
                  Bergabung dengan siswa
                </span>{' '}
                di
              </p>
              <p>30+ kota di Indonesia.</p>
            </div>
          </div>
        </div>

        {/* Search results preview window */}
        <div className='relative hidden md:block'>
          {/* Outer drop shadow wrapper */}
          <div className='border-primary-100 shadow-primary-500/10 relative overflow-hidden rounded-2xl border bg-white shadow-2xl'>
            {/* Window chrome */}
            <div className='border-primary-100 bg-primary-50/50 flex items-center gap-2 border-b px-4 py-3'>
              <div className='flex gap-1.5'>
                <span className='size-2.5 rounded-full bg-rose-400' />
                <span className='size-2.5 rounded-full bg-amber-400' />
                <span className='size-2.5 rounded-full bg-emerald-400' />
              </div>
              <div className='mono text-muted-foreground ml-3 flex-1 truncate text-[11px] tabular-nums'>
                tutorconnect.id/tutor?mapel=Matematika
              </div>
            </div>

            {/* Filter bar */}
            <div className='border-primary-100 flex flex-wrap items-center gap-2 border-b px-5 py-3'>
              <span className='bg-primary-100 text-primary-800 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium'>
                Matematika
              </span>
              <span className='border-primary-200 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]'>
                SMA
              </span>
              <span className='border-primary-200 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]'>
                ≤ Rp150k
              </span>
              <span className='text-muted-foreground ml-auto text-[11px]'>
                <span className='mono text-foreground font-semibold tabular-nums'>
                  127
                </span>{' '}
                tutor
              </span>
            </div>

            {/* Tutor list */}
            <div className='divide-primary-100 divide-y'>
              {HERO_TUTORS.map((t) => (
                <div
                  key={t.name}
                  className={`relative flex items-start gap-3 px-5 py-4 transition-colors ${
                    t.highlighted ? 'bg-primary-50/40' : 'bg-white'
                  }`}
                >
                  {t.highlighted ? (
                    <span className='bg-primary-600 absolute top-1/2 left-0 h-12 w-0.5 -translate-y-1/2 rounded-r' />
                  ) : null}
                  <div
                    className={`ring-primary-100 flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ring-2 ${t.avatar}`}
                  >
                    {t.initials}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-1.5'>
                      <h3 className='truncate text-sm font-semibold'>
                        {t.name}
                      </h3>
                      <ShieldCheck
                        className='size-3.5 shrink-0 text-emerald-600'
                        aria-label='Terverifikasi'
                      />
                    </div>
                    <p className='text-muted-foreground truncate text-xs'>
                      {t.subject} · {t.city}
                    </p>
                    <div className='mono text-muted-foreground mt-1.5 flex items-center gap-2 text-[11px] tabular-nums'>
                      <span className='inline-flex items-center gap-0.5'>
                        <Star className='size-3 fill-amber-400 text-amber-400' />
                        <span className='text-foreground font-semibold'>
                          {t.rating.toFixed(1)}
                        </span>
                      </span>
                      <span aria-hidden>·</span>
                      <span>{t.sessions} sesi</span>
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='mono text-primary-900 text-sm font-bold tabular-nums'>
                      {t.rate}
                    </div>
                    <div className='text-muted-foreground text-[10px]'>
                      /jam
                    </div>
                    <span className='bg-secondary-50 text-secondary-800 border-secondary-200 mt-1.5 inline-block rounded-full border px-1.5 py-0.5 text-[10px] font-medium'>
                      Tersedia
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom fade hint */}
            <div className='border-primary-100 bg-primary-50/30 border-t px-5 py-3 text-center text-[11px]'>
              <span className='text-muted-foreground'>
                + 124 tutor lain sesuai filter Anda
              </span>
            </div>
          </div>

          {/* Floating stickers — outside the window for depth */}
          <div className='border-primary-100 absolute -bottom-3 -left-4 z-10 flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 shadow-lg'>
            <PiggyBank className='text-secondary-600 size-3.5' />
            <span className='text-xs font-medium'>Refund otomatis</span>
          </div>
          <div className='border-primary-100 absolute -top-3 -right-3 z-10 flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 shadow-lg'>
            <CheckCircle2 className='size-3.5 text-emerald-600' />
            <span className='text-xs font-medium'>Verifikasi 1×24 jam</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  return (
    <section className='border-primary-100 bg-primary-50/30 border-y py-6'>
      <div className='layout text-muted-foreground flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs'>
        <span className='inline-flex items-center gap-2'>
          <ShieldCheck className='size-3.5 text-emerald-600' />
          Verifikasi dokumen 1×24 jam
        </span>
        <span className='inline-flex items-center gap-2'>
          <CheckCircle2 className='size-3.5 text-emerald-600' />
          Refund otomatis jika sesi dibatalkan
        </span>
        <span className='inline-flex items-center gap-2'>
          <PiggyBank className='text-secondary-600 size-3.5' />
          Photo-first payment, tidak ada gateway pihak ketiga
        </span>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id='fitur' className='py-16 sm:py-24 md:py-32'>
      <div className='layout'>
        <div className='max-w-2xl'>
          <h2 className='text-foreground text-3xl font-semibold tracking-[-0.025em] text-balance md:text-4xl'>
            Dibangun untuk siswa dan tutor di Indonesia.
          </h2>
          <p className='text-muted-foreground mt-3 text-base text-pretty'>
            Bukan platform global yang dipoles. Pembayaran, verifikasi, dan
            kurikulum dirancang untuk konteks lokal.
          </p>
        </div>

        {/* Asymmetric 2-col layout: big lead + list */}
        <div className='mt-12 grid gap-8 md:grid-cols-[1.3fr_1fr] md:gap-12'>
          {/* Lead feature: tinted full-bleed panel */}
          <article className='border-primary-100 from-primary-50/60 group flex flex-col justify-between overflow-hidden rounded-2xl border bg-gradient-to-br to-white p-6 sm:p-8 md:p-10'>
            <div>
              <div className='bg-primary-600 text-primary-foreground shadow-primary-500/20 inline-flex items-center justify-center rounded-lg p-2.5 shadow-sm'>
                <ShieldCheck className='size-5' />
              </div>
              <h3 className='text-foreground mt-6 text-2xl font-semibold tracking-tight md:text-3xl'>
                Setiap tutor diverifikasi.
              </h3>
              <p className='text-muted-foreground mt-3 text-base leading-relaxed'>
                Tim admin meninjau KTP dan ijazah sebelum profil tutor muncul di
                pencarian. Tidak ada self-signup yang langsung tampil ke siswa.
              </p>
            </div>
            <ul className='mt-8 space-y-2.5 text-sm'>
              <li className='flex items-start gap-2'>
                <CheckCircle2 className='text-primary-600 mt-0.5 size-4 shrink-0' />
                Identitas dicocokkan dengan dokumen
              </li>
              <li className='flex items-start gap-2'>
                <CheckCircle2 className='text-primary-600 mt-0.5 size-4 shrink-0' />
                Status verifikasi terlihat di kartu tutor
              </li>
              <li className='flex items-start gap-2'>
                <CheckCircle2 className='text-primary-600 mt-0.5 size-4 shrink-0' />
                Re-verifikasi setiap pergantian ijazah
              </li>
            </ul>
          </article>

          {/* Supporting list, no card chrome */}
          <ul className='divide-primary-100 divide-y'>
            {[
              {
                icon: Search,
                title: 'Pencarian terstruktur',
                body: 'Filter berdasarkan mapel, jenjang, metode, dan rentang tarif.',
              },
              {
                icon: CalendarCheck,
                title: 'Jadwal per slot',
                body: 'Tutor menetapkan slot mingguan. Konflik booking dicek di server.',
              },
              {
                icon: PiggyBank,
                title: 'Pembayaran transparan',
                body: 'Photo-first proof, dikonfirmasi admin, ledger setiap rupiah.',
              },
            ].map((f) => (
              <li
                key={f.title}
                className='flex gap-4 py-5 first:pt-0 last:pb-0'
              >
                <div className='border-primary-100 text-primary-700 flex size-10 shrink-0 items-center justify-center rounded-lg border bg-white'>
                  <f.icon className='size-4' />
                </div>
                <div>
                  <h3 className='text-foreground text-base font-semibold'>
                    {f.title}
                  </h3>
                  <p className='text-muted-foreground mt-1 text-sm leading-relaxed'>
                    {f.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    title: 'Daftar dan verifikasi email',
    body: 'Pilih peran sebagai siswa atau tutor, lalu konfirmasi email Anda.',
  },
  {
    title: 'Ajukan ke tutor pilihan',
    body: 'Cari tutor sesuai mapel, kirim aplikasi singkat. Tutor merespons dalam 24 jam.',
  },
  {
    title: 'Pesan sesi, transfer, belajar',
    body: 'Upload bukti transfer, admin konfirmasi, jadwal masuk kalender Anda.',
  },
];

function Steps() {
  return (
    <section
      id='cara'
      className='border-primary-100 bg-primary-50/30 border-y py-16 sm:py-24 md:py-32'
    >
      <div className='layout'>
        <div className='flex items-end justify-between gap-6'>
          <div className='max-w-xl'>
            <h2 className='text-foreground text-3xl font-semibold tracking-[-0.025em] text-balance md:text-4xl'>
              Dari pencarian sampai sesi pertama, di bawah 24 jam.
            </h2>
          </div>
          <Link
            href='/auth/register'
            className='text-primary-700 hover:text-primary-900 hidden text-sm font-medium md:inline-flex md:items-center md:gap-1'
          >
            Mulai sekarang <ArrowUpRight className='size-3.5' />
          </Link>
        </div>

        {/* Horizontal stepper, no circle numbers */}
        <ol className='bg-primary-100 mt-14 grid gap-px overflow-hidden rounded-2xl md:grid-cols-3'>
          {STEPS.map((s, i) => (
            <li key={s.title} className='bg-white p-5 sm:p-6 md:p-8'>
              <div className='text-primary-600 mono mb-4 text-xs font-semibold tracking-widest tabular-nums'>
                {String(i + 1).padStart(2, '0')} /{' '}
                {String(STEPS.length).padStart(2, '0')}
              </div>
              <h3 className='text-foreground text-lg font-semibold'>
                {s.title}
              </h3>
              <p className='text-muted-foreground mt-2 text-sm leading-relaxed'>
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id='harga' className='py-16 sm:py-24 md:py-32'>
      <div className='layout'>
        <div className='max-w-2xl'>
          <h2 className='text-foreground text-3xl font-semibold tracking-[-0.025em] text-balance md:text-4xl'>
            Gratis untuk mulai. Upgrade saat Anda butuh.
          </h2>
          <p className='text-muted-foreground mt-3 text-base text-pretty'>
            Komisi platform sudah termasuk. Tidak ada biaya tersembunyi.
          </p>
        </div>

        <div className='mt-14 grid gap-6 md:grid-cols-2'>
          <PricingCard
            name='Premium Siswa'
            price='Rp 50.000'
            cadence='/bulan'
            description='Untuk siswa yang ingin akses penuh ke materi dan diskon sesi.'
            features={[
              'Akses semua materi premium',
              'Prioritas booking sesi populer',
              'Dukungan via WhatsApp',
              'Diskon 10% untuk sesi pertama',
            ]}
            cta='Daftar sebagai siswa'
            href='/auth/register/student'
            variant='subtle'
          />
          <PricingCard
            name='Pro Tutor'
            price='Rp 100.000'
            cadence='/bulan'
            description='Untuk tutor yang ingin komisi lebih rendah dan analitik profil.'
            features={[
              'Komisi platform turun 5%',
              'Analitik penghasilan dan retensi',
              'Badge Pro di kartu pencarian',
              'Boost prioritas tampilan',
            ]}
            cta='Daftar sebagai tutor'
            href='/auth/register/tutor'
            variant='highlight'
            badge='Paling populer'
          />
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  name,
  price,
  cadence,
  description,
  features,
  cta,
  href,
  variant,
  badge,
}: {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  variant: 'subtle' | 'highlight';
  badge?: string;
}) {
  const isHi = variant === 'highlight';
  return (
    <article
      className={`relative flex flex-col rounded-2xl p-6 sm:p-8 md:p-10 ${
        isHi
          ? 'border-primary-300 ring-primary-200/50 shadow-primary-500/5 border bg-white shadow-md ring-2'
          : 'border-primary-100 border bg-white'
      }`}
    >
      {badge ? (
        <span className='bg-primary-600 text-primary-foreground absolute -top-3 left-8 rounded-full px-3 py-1 text-[10px] font-semibold tracking-wider uppercase'>
          {badge}
        </span>
      ) : null}
      <h3 className='text-foreground text-xl font-semibold'>{name}</h3>
      <p className='text-muted-foreground mt-1 text-sm'>{description}</p>
      <div className='mt-6 flex items-baseline gap-1'>
        <span className='mono text-foreground text-3xl font-semibold tabular-nums sm:text-4xl'>
          {price}
        </span>
        <span className='text-muted-foreground text-sm'>{cadence}</span>
      </div>
      <ul className='mt-6 space-y-2.5 text-sm'>
        {features.map((f) => (
          <li key={f} className='flex items-start gap-2'>
            <CheckCircle2
              className={`mt-0.5 size-4 shrink-0 ${
                isHi ? 'text-primary-600' : 'text-emerald-600'
              }`}
            />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <div className='mt-auto pt-8'>
        <Link href={href} className='block'>
          <Button
            className='w-full'
            size='lg'
            variant={isHi ? 'default' : 'outline'}
          >
            {cta}
          </Button>
        </Link>
      </div>
    </article>
  );
}

const TESTIMONIALS = [
  {
    name: 'Sarah Putri',
    role: 'Siswa SMA, Jakarta',
    initials: 'SP',
    quote:
      'Nilai matematika saya naik dari 70 ke 92 setelah tiga bulan. Tutor sabar, materi nyambung dengan kurikulum sekolah.',
    featured: true,
  },
  {
    name: 'Budi Santoso',
    role: 'Tutor Fisika',
    initials: 'BS',
    quote:
      'Pembayaran lancar dan tidak ada pungutan tambahan. Saya fokus mengajar, admin yang urus verifikasi.',
  },
  {
    name: 'Lia Maharani',
    role: 'Mahasiswa Bandung',
    initials: 'LM',
    quote:
      'Filter pencarian sesuai jadwal kuliah. Bisa cari tutor yang available malam.',
  },
];

function Testimonials() {
  const lead = TESTIMONIALS.find((t) => t.featured)!;
  const supporting = TESTIMONIALS.filter((t) => !t.featured);

  return (
    <section className='border-primary-100 bg-primary-50/30 border-y py-16 sm:py-24 md:py-32'>
      <div className='layout grid items-start gap-10 md:grid-cols-[1.4fr_1fr] md:gap-14'>
        <figure>
          <div className='flex gap-0.5 text-amber-500'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className='size-4 fill-current' />
            ))}
          </div>
          <blockquote className='text-foreground mt-5 text-2xl leading-snug font-medium tracking-tight text-balance md:text-3xl md:leading-snug'>
            &ldquo;{lead.quote}&rdquo;
          </blockquote>
          <figcaption className='mt-6 flex items-center gap-3'>
            <Avatar className='ring-primary-100 size-10 ring-2'>
              <AvatarFallback className='from-primary-400 to-primary-600 bg-gradient-to-br text-xs font-bold text-white'>
                {lead.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className='text-sm font-semibold'>{lead.name}</div>
              <div className='text-muted-foreground text-xs'>{lead.role}</div>
            </div>
          </figcaption>
        </figure>

        <div className='divide-primary-100 space-y-0 divide-y'>
          {supporting.map((t) => (
            <figure key={t.name} className='py-6 first:pt-0 last:pb-0'>
              <blockquote className='text-foreground text-base leading-relaxed'>
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className='text-muted-foreground mt-3 text-xs'>
                <span className='text-foreground font-medium'>{t.name}</span> ·{' '}
                {t.role}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: 'Bagaimana cara mendaftar?',
    a: 'Klik Daftar di pojok kanan atas, pilih peran (siswa atau tutor), dan isi data dasar. Verifikasi email akan dikirim ke inbox Anda.',
  },
  {
    q: 'Apakah pembayaran aman?',
    a: 'Ya. Setiap pembayaran ditinjau admin sebelum dana dilepas ke tutor. Jika sesi dibatalkan, dana dikembalikan otomatis ke saldo Anda.',
  },
  {
    q: 'Bagaimana tutor diverifikasi?',
    a: 'Admin meninjau dokumen identitas (KTP) dan ijazah dalam 1×24 jam. Profil tutor baru muncul di pencarian setelah diverifikasi.',
  },
  {
    q: 'Apakah ada biaya pendaftaran?',
    a: 'Tidak. Pendaftaran gratis. Komisi platform hanya diambil saat sesi berlangsung.',
  },
  {
    q: 'Bagaimana jika sesi dibatalkan?',
    a: 'Pembayaran dikembalikan otomatis ke saldo siswa. Hubungi admin jika ada keberatan dengan pembatalan dari tutor.',
  },
  {
    q: 'Apa bedanya Premium dan Pro?',
    a: 'Premium untuk siswa: akses materi dan diskon. Pro untuk tutor: komisi platform lebih rendah dan analitik penghasilan.',
  },
];

function FAQ() {
  return (
    <section id='faq' className='py-16 sm:py-24 md:py-32'>
      <div className='layout grid gap-12 md:grid-cols-[1fr_2fr]'>
        <div>
          <h2 className='text-foreground text-3xl font-semibold tracking-[-0.025em] text-balance md:text-4xl'>
            Pertanyaan umum.
          </h2>
          <p className='text-muted-foreground mt-3 text-sm text-pretty'>
            Tidak menemukan jawaban? Hubungi tim kami di{' '}
            <a
              href='mailto:halo@tutorconnect.id'
              className='text-primary-700 hover:text-primary-900 font-medium'
            >
              halo@tutorconnect.id
            </a>
            .
          </p>
        </div>
        <Accordion type='single' collapsible className='w-full'>
          {FAQS.map((item, i) => (
            <AccordionItem key={i} value={String(i)}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section className='py-16 sm:py-24 md:py-32'>
      <div className='layout'>
        <div className='border-primary-100 from-primary-50 via-secondary-50/40 to-primary-100/60 relative overflow-hidden rounded-3xl border bg-gradient-to-br'>
          {/* Indigo dot grid texture */}
          <div
            aria-hidden
            className='pointer-events-none absolute inset-0 opacity-[0.08]'
            style={{
              backgroundImage:
                'radial-gradient(oklch(0.36 0.144 278) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          {/* Teal soft glow, top-right */}
          <div
            aria-hidden
            className='pointer-events-none absolute -top-32 -right-32 size-[34rem] rounded-full opacity-60 blur-3xl'
            style={{
              background:
                'radial-gradient(circle at center, oklch(0.85 0.12 188 / 0.5), transparent 60%)',
            }}
          />
          {/* Indigo soft glow, bottom-left */}
          <div
            aria-hidden
            className='pointer-events-none absolute -bottom-40 -left-32 size-[40rem] rounded-full opacity-60 blur-3xl'
            style={{
              background:
                'radial-gradient(circle at center, oklch(0.85 0.1 277 / 0.5), transparent 60%)',
            }}
          />

          <div className='relative grid items-center gap-10 px-6 py-12 sm:px-8 sm:py-16 md:grid-cols-[1.4fr_1fr] md:gap-16 md:px-16 md:py-20'>
            {/* Left: pitch */}
            <div className='max-w-xl'>
              <div className='border-secondary-200 bg-secondary-50 text-secondary-800 mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium'>
                <Sparkles className='size-3' />
                Daftar gratis, tanpa kartu kredit
              </div>
              <h2 className='text-foreground text-3xl leading-[1.1] font-semibold tracking-[-0.03em] text-balance sm:text-4xl sm:leading-[1.05] md:text-5xl lg:text-6xl'>
                Tutor pertama Anda <br className='hidden md:block' />
                <span className='text-primary-700 italic'>menunggu.</span>
              </h2>
              <p className='text-muted-foreground mt-5 text-base text-pretty md:text-lg'>
                Buat akun siswa dalam 2 menit. Browsing tutor dan ajukan
                aplikasi tanpa biaya, bayar hanya saat sesi terjadwal.
              </p>
              <div className='mt-9 flex flex-wrap gap-3'>
                <Link href='/auth/register/student'>
                  <Button
                    size='lg'
                    className='shadow-primary-500/20 gap-1.5 px-6 shadow-lg'
                  >
                    Daftar sebagai siswa <ArrowRight className='size-4' />
                  </Button>
                </Link>
                <Link href='/auth/register/tutor'>
                  <Button size='lg' variant='outline' className='px-6'>
                    Jadi tutor
                  </Button>
                </Link>
              </div>
              <div className='mt-8 flex items-center gap-4'>
                <div className='flex -space-x-2'>
                  {['IA', 'RS', 'MK', 'NF'].map((s, i) => (
                    <div
                      key={s}
                      className={`ring-background size-7 rounded-full ring-2 ${
                        [
                          'from-primary-400 to-primary-600 bg-gradient-to-br',
                          'from-secondary-400 to-secondary-600 bg-gradient-to-br',
                          'bg-gradient-to-br from-amber-400 to-amber-600',
                          'bg-gradient-to-br from-rose-400 to-rose-600',
                        ][i]
                      } flex items-center justify-center text-[9px] font-bold text-white`}
                    >
                      {s}
                    </div>
                  ))}
                </div>
                <p className='text-muted-foreground text-xs'>
                  <span className='mono text-foreground font-semibold tabular-nums'>
                    340+
                  </span>{' '}
                  siswa baru daftar minggu ini
                </p>
              </div>
            </div>

            {/* Right: stat panel */}
            <aside className='relative'>
              <div className='border-primary-100 shadow-primary-500/5 rounded-2xl border bg-white p-6 shadow-lg md:p-7'>
                <p className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
                  Tutor aktif sekarang
                </p>
                <p className='mono text-primary-700 mt-2 text-5xl leading-none font-semibold tabular-nums sm:text-6xl md:text-7xl'>
                  127
                </p>
                <p className='text-muted-foreground mt-2 text-sm'>
                  siap mengajar di 12 mata pelajaran
                </p>
                <div className='border-primary-100 mt-6 grid grid-cols-2 gap-4 border-t pt-5'>
                  <div>
                    <p className='mono text-foreground text-2xl font-semibold tabular-nums'>
                      4j
                    </p>
                    <p className='text-muted-foreground mt-0.5 text-[11px]'>
                      Respons rata-rata
                    </p>
                  </div>
                  <div>
                    <p className='mono text-foreground text-2xl font-semibold tabular-nums'>
                      24j
                    </p>
                    <p className='text-muted-foreground mt-0.5 text-[11px]'>
                      Verifikasi tutor
                    </p>
                  </div>
                </div>
              </div>
              {/* Floating mini chip */}
              <div className='border-primary-100 absolute -bottom-3 -left-3 inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-xs font-medium shadow-md'>
                <CheckCircle2 className='size-3.5 text-emerald-600' />
                Tanpa biaya tersembunyi
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className='border-primary-100 border-t bg-white py-14'>
      <div className='layout grid gap-10 md:grid-cols-[2fr_1fr_1fr]'>
        <div className='max-w-sm space-y-4'>
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
          <p className='text-muted-foreground text-sm leading-relaxed'>
            Marketplace tutor-siswa untuk Indonesia. Verifikasi dokumen,
            pembayaran transparan, refund otomatis.
          </p>
        </div>
        <div>
          <div className='text-foreground mb-3 text-sm font-semibold'>
            Produk
          </div>
          <ul className='text-muted-foreground space-y-2 text-sm'>
            <li>
              <Link href='/student/tutors' className='hover:text-foreground'>
                Cari tutor
              </Link>
            </li>
            <li>
              <Link
                href='/auth/register/tutor'
                className='hover:text-foreground'
              >
                Jadi tutor
              </Link>
            </li>
            <li>
              <a href='#harga' className='hover:text-foreground'>
                Harga
              </a>
            </li>
          </ul>
        </div>
        <div>
          <div className='text-foreground mb-3 text-sm font-semibold'>
            Legal
          </div>
          <ul className='text-muted-foreground space-y-2 text-sm'>
            <li>
              <Link href='/legal/terms' className='hover:text-foreground'>
                Syarat layanan
              </Link>
            </li>
            <li>
              <Link href='/legal/privacy' className='hover:text-foreground'>
                Kebijakan privasi
              </Link>
            </li>
            <li>
              <a
                href='mailto:halo@tutorconnect.id'
                className='hover:text-foreground'
              >
                Kontak
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className='layout text-muted-foreground border-primary-100 mt-10 flex flex-wrap items-center justify-between gap-2 border-t pt-6 text-xs'>
        <span>© {new Date().getFullYear()} TutorConnect.</span>
        <span>Dibangun di Indonesia.</span>
      </div>
    </footer>
  );
}
