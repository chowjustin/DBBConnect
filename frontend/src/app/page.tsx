'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  GraduationCap,
  PiggyBank,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function LandingPage() {
  return (
    <div className='text-foreground flex min-h-screen flex-col bg-white'>
      <Header />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className='border-primary-100/60 sticky top-0 z-10 border-b bg-white/70 backdrop-blur-xl'>
      <div className='layout flex items-center justify-between py-4'>
        <Link
          href='/'
          className='inline-flex items-center gap-2 text-lg font-bold'
        >
          <GraduationCap className='text-primary size-6' />
          DBBConnect
        </Link>
        <nav className='flex items-center gap-3'>
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
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className='relative overflow-hidden py-20 sm:py-28'>
      {/* Gradient mesh background */}
      <div className='pointer-events-none absolute inset-0 -z-10'>
        <div className='bg-primary-200/40 absolute -top-32 -left-32 size-96 rounded-full blur-3xl' />
        <div className='bg-primary-400/30 absolute -top-40 right-0 size-96 rounded-full blur-3xl' />
        <div className='bg-primary-300/30 absolute bottom-0 left-1/3 size-96 rounded-full blur-3xl' />
      </div>
      <div className='layout grid items-center gap-12 lg:grid-cols-2'>
        <div className='space-y-6'>
          <span className='bg-primary-100/80 text-primary-700 ring-primary-200 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1'>
            <Sparkles className='size-3' /> 1000+ tutor terverifikasi
          </span>
          <h1 className='h0 leading-tight tracking-tighter'>
            Belajar lebih dekat dengan{' '}
            <span className='from-primary-600 to-primary-900 bg-gradient-to-r bg-clip-text text-transparent'>
              tutor terbaik
            </span>
          </h1>
          <p className='text-primary-900/70 text-base md:text-xl'>
            Cari tutor, pesan sesi, dan kelola pembayaran dalam satu platform
            yang aman dan transparan.
          </p>
          <div className='flex flex-wrap gap-3'>
            <Link href='/auth/register/student'>
              <Button
                size='lg'
                className='group shadow-primary-500/20 gap-2 px-6 shadow-lg'
              >
                Cari Tutor
                <ArrowRight className='size-4 transition-transform group-hover:translate-x-0.5' />
              </Button>
            </Link>
            <Link href='/auth/register/tutor'>
              <Button size='lg' variant='outline' className='px-6'>
                Jadi Tutor
              </Button>
            </Link>
          </div>
        </div>

        {/* Floating mockup card */}
        <div className='relative hidden lg:block'>
          <div className='glass mx-auto max-w-sm rounded-2xl p-6'>
            <div className='flex items-start gap-3'>
              <Avatar className='ring-primary-100 size-12 ring-2'>
                <AvatarFallback className='from-primary-400 to-primary-600 bg-gradient-to-br font-bold text-white'>
                  DB
                </AvatarFallback>
              </Avatar>
              <div className='flex-1'>
                <div className='font-semibold'>Tutor Terverifikasi</div>
                <div className='text-muted-foreground flex items-center gap-1 text-xs'>
                  <Star className='size-3 fill-amber-400 text-amber-400' />
                  4.9 · Banyak ulasan
                </div>
              </div>
              <div className='text-right'>
                <div className='mono text-primary-900 text-sm font-bold'>
                  Mulai
                </div>
                <div className='text-muted-foreground text-[10px]'>per jam</div>
              </div>
            </div>
            <p className='text-muted-foreground mt-3 text-sm'>
              Belajar dengan tutor profesional, fleksibel, dan terjadwal.
            </p>
            <div className='mt-3 flex flex-wrap gap-1.5'>
              <span className='bg-primary-50 text-primary-700 border-primary-100 rounded-full border px-2 py-0.5 text-[10px] font-medium'>
                Matematika
              </span>
              <span className='bg-primary-50 text-primary-700 border-primary-100 rounded-full border px-2 py-0.5 text-[10px] font-medium'>
                Fisika
              </span>
              <span className='border-secondary-200 bg-secondary-50 text-secondary-800 rounded-full border px-2 py-0.5 text-[10px] font-medium'>
                Verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AnimatedCounter({ target }: { target: number }) {
  const [value, setValue] = React.useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const start = performance.now();
      const duration = 1500;
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        setValue(Math.floor(p * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      obs.disconnect();
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{value.toLocaleString('id-ID')}</span>;
}

function Stats() {
  return (
    <section className='bg-primary-50/40 border-primary-100/60 border-y py-12'>
      <div className='layout grid grid-cols-2 gap-6 md:grid-cols-4'>
        {[
          { n: 1200, label: 'Tutor Terverifikasi' },
          { n: 8500, label: 'Sesi Berlangsung' },
          { n: 12, label: 'Mata Pelajaran' },
          { n: 30, label: 'Kota Terjangkau' },
        ].map((s) => (
          <div key={s.label} className='text-center'>
            <div className='mono text-primary-900 text-3xl font-bold md:text-4xl'>
              <AnimatedCounter target={s.n} />+
            </div>
            <div className='text-muted-foreground mt-1 text-xs font-semibold tracking-wide uppercase'>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: Search,
    title: 'Pencarian Cerdas',
    body: 'Filter berdasarkan mapel, level, metode, dan rating.',
  },
  {
    icon: ShieldCheck,
    title: 'Tutor Terverifikasi',
    body: 'Setiap tutor diverifikasi admin dengan dokumen lengkap.',
  },
  {
    icon: CalendarCheck,
    title: 'Jadwal Fleksibel',
    body: 'Pilih slot sesuai ketersediaan tutor.',
  },
  {
    icon: PiggyBank,
    title: 'Pembayaran Aman',
    body: 'Photo-first dengan konfirmasi admin sebelum dana dilepas.',
  },
];

function Features() {
  return (
    <section className='py-20'>
      <div className='layout space-y-10'>
        <div className='mx-auto max-w-2xl text-center'>
          <h2 className='h2'>Kenapa DBBConnect?</h2>
          <p className='text-muted-foreground mt-2'>
            Platform yang dirancang untuk siswa dan tutor di Indonesia.
          </p>
        </div>
        <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-4'>
          {FEATURES.map((f) => (
            <Card
              key={f.title}
              className='from-primary-50/40 hover:shadow-primary-500/10 bg-gradient-to-b to-white transition-all hover:-translate-y-1 hover:shadow-lg'
            >
              <CardContent className='space-y-3 pt-6'>
                <div className='bg-primary-100 text-primary-700 ring-primary-200/60 inline-flex rounded-lg p-2 ring-1'>
                  <f.icon className='size-5' />
                </div>
                <h3 className='h4'>{f.title}</h3>
                <p className='text-muted-foreground text-sm'>{f.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className='bg-primary-50/40 py-20'>
      <div className='layout space-y-10'>
        <div className='mx-auto max-w-2xl text-center'>
          <h2 className='h2'>Cara Kerja</h2>
          <p className='text-muted-foreground mt-2'>
            Tiga langkah sederhana untuk mulai belajar.
          </p>
        </div>
        <div className='grid gap-6 md:grid-cols-3'>
          {[
            {
              n: 1,
              title: 'Daftar',
              body: 'Buat akun siswa atau tutor dalam hitungan menit.',
            },
            {
              n: 2,
              title: 'Pilih Tutor',
              body: 'Cari tutor sesuai kebutuhan dan ajukan aplikasi.',
            },
            {
              n: 3,
              title: 'Belajar',
              body: 'Pesan sesi, bayar, dan ikuti pembelajaran.',
            },
          ].map((s, i) => (
            <div
              key={s.n}
              className='space-y-3 text-center'
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className='from-primary-500 to-primary-700 shadow-primary-500/30 mx-auto flex size-14 items-center justify-center rounded-full bg-gradient-to-br text-2xl font-bold text-white shadow-lg'>
                {s.n}
              </div>
              <h3 className='h4'>{s.title}</h3>
              <p className='text-muted-foreground text-sm'>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className='py-20'>
      <div className='layout space-y-10'>
        <div className='mx-auto max-w-2xl text-center'>
          <h2 className='h2'>Pilih Paket</h2>
          <p className='text-muted-foreground mt-2'>
            Mulai gratis. Upgrade kapan saja.
          </p>
        </div>
        <div className='mx-auto grid max-w-4xl gap-5 sm:grid-cols-2'>
          {/* Premium Siswa */}
          <Card className='hover:shadow-primary-500/5 transition-all hover:shadow-md'>
            <CardContent className='space-y-4 pt-6'>
              <div>
                <h3 className='h3'>Premium Siswa</h3>
                <div className='mono text-primary-900 mt-2 text-3xl font-bold'>
                  Rp 50.000
                  <span className='text-muted-foreground ml-1 text-sm font-normal'>
                    /bln
                  </span>
                </div>
              </div>
              <ul className='space-y-2 text-sm'>
                {[
                  'Akses semua materi premium',
                  'Prioritas booking sesi',
                  'Dukungan pelanggan langsung',
                  'Diskon 10% untuk sesi pertama',
                ].map((p) => (
                  <li key={p} className='flex items-start gap-2'>
                    <CheckCircle2 className='mt-0.5 size-4 shrink-0 text-emerald-600' />
                    {p}
                  </li>
                ))}
              </ul>
              <Link href='/auth/register/student' className='block'>
                <Button variant='outline' className='w-full' size='lg'>
                  Daftar
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pro Tutor — highlighted */}
          <Card className='border-primary-300 ring-primary-100 relative overflow-hidden ring-2'>
            <div className='from-primary-600 to-primary-400 bg-gradient-to-r px-4 py-1 text-center text-xs font-bold tracking-wider text-white uppercase'>
              Paling Populer
            </div>
            <CardContent className='space-y-4 pt-6'>
              <div>
                <h3 className='h3 flex items-center gap-2'>
                  Pro Tutor
                  <Sparkles className='size-5 text-amber-500' />
                </h3>
                <div className='mono text-primary-900 mt-2 text-3xl font-bold'>
                  Rp 100.000
                  <span className='text-muted-foreground ml-1 text-sm font-normal'>
                    /bln
                  </span>
                </div>
              </div>
              <ul className='space-y-2 text-sm'>
                {[
                  'Komisi platform turun 5%',
                  'Analitik lengkap dan trend',
                  'Badge Pro di profil',
                  'Boost prioritas pencarian',
                ].map((p) => (
                  <li key={p} className='flex items-start gap-2'>
                    <CheckCircle2 className='mt-0.5 size-4 shrink-0 text-emerald-600' />
                    {p}
                  </li>
                ))}
              </ul>
              <Link href='/auth/register/tutor' className='block'>
                <Button className='w-full' size='lg'>
                  Daftar
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  {
    name: 'Sarah Putri',
    role: 'Siswa SMA',
    quote:
      'Nilai matematika saya naik dari 70 ke 92 setelah belajar dengan tutor di DBBConnect. Tutornya sabar dan jelas.',
  },
  {
    name: 'Budi Santoso',
    role: 'Tutor Fisika',
    quote:
      'Platform yang sangat membantu. Pembayaran lancar dan saya bisa fokus mengajar tanpa khawatir admin.',
  },
  {
    name: 'Lia Maharani',
    role: 'Mahasiswa',
    quote:
      'Suka banget dengan filter pencariannya. Saya bisa cari tutor yang cocok dengan jadwal kuliah saya.',
  },
];

function Testimonials() {
  return (
    <section className='bg-primary-50/40 py-20'>
      <div className='layout space-y-10'>
        <div className='mx-auto max-w-2xl text-center'>
          <h2 className='h2'>Apa Kata Mereka</h2>
        </div>
        <div className='grid gap-5 md:grid-cols-3'>
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} className='transition-shadow hover:shadow-md'>
              <CardContent className='space-y-4 pt-6'>
                <div className='flex gap-0.5 text-amber-400'>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className='size-4 fill-current' />
                  ))}
                </div>
                <p className='text-sm'>“{t.quote}”</p>
                <div className='flex items-center gap-3'>
                  <Avatar className='size-9'>
                    <AvatarFallback className='from-primary-400 to-primary-600 bg-gradient-to-br text-xs font-bold text-white'>
                      {t.name
                        .split(' ')
                        .map((p) => p[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className='text-sm font-semibold'>{t.name}</div>
                    <div className='text-muted-foreground text-xs'>
                      {t.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section className='py-20'>
      <div className='layout max-w-3xl space-y-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <h2 className='h2'>Pertanyaan Umum</h2>
        </div>
        <Accordion type='single' collapsible className='w-full'>
          {[
            {
              q: 'Bagaimana cara mendaftar?',
              a: 'Klik tombol Daftar di atas, pilih peran (siswa atau tutor), dan isi data dasar. Verifikasi email akan dikirim.',
            },
            {
              q: 'Apakah pembayaran aman?',
              a: 'Ya. Setiap pembayaran diverifikasi admin sebelum dana dilepas ke tutor.',
            },
            {
              q: 'Bagaimana tutor diverifikasi?',
              a: 'Admin meninjau dokumen identitas (KTP) dan ijazah sebelum tutor dapat menerima sesi.',
            },
            {
              q: 'Apakah ada biaya pendaftaran?',
              a: 'Tidak. Daftar gratis. Komisi platform hanya diambil saat sesi berlangsung.',
            },
            {
              q: 'Bagaimana jika sesi dibatalkan?',
              a: 'Pembayaran akan dikembalikan otomatis. Hubungi admin jika ada keberatan.',
            },
            {
              q: 'Apa bedanya Premium dan Pro?',
              a: 'Premium untuk siswa (akses materi + diskon). Pro untuk tutor (komisi lebih rendah + analitik).',
            },
          ].map((item, i) => (
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

function Footer() {
  return (
    <footer className='border-primary-100 border-t bg-white py-12'>
      <div className='layout grid gap-8 md:grid-cols-4'>
        <div className='space-y-3'>
          <Link
            href='/'
            className='inline-flex items-center gap-2 text-lg font-bold'
          >
            <GraduationCap className='text-primary size-5' />
            DBBConnect
          </Link>
          <p className='text-muted-foreground text-xs'>
            Marketplace tutor-siswa untuk Indonesia.
          </p>
        </div>
        <div>
          <div className='mb-2 text-sm font-semibold'>Produk</div>
          <ul className='text-muted-foreground space-y-1 text-xs'>
            <li>Cari Tutor</li>
            <li>Jadi Tutor</li>
            <li>Harga</li>
          </ul>
        </div>
        <div>
          <div className='mb-2 text-sm font-semibold'>Sumber</div>
          <ul className='text-muted-foreground space-y-1 text-xs'>
            <li>Pusat Bantuan</li>
            <li>Blog</li>
            <li>Kontak</li>
          </ul>
        </div>
        <div>
          <div className='mb-2 text-sm font-semibold'>Legal</div>
          <ul className='text-muted-foreground space-y-1 text-xs'>
            <li>
              <Link href='/legal/terms'>Syarat Layanan</Link>
            </li>
            <li>
              <Link href='/legal/privacy'>Privasi</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className='layout text-muted-foreground border-primary-100 mt-8 border-t pt-6 text-center text-xs'>
        © {new Date().getFullYear()} DBBConnect. All rights reserved.
      </div>
    </footer>
  );
}
