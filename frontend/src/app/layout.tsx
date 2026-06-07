import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'DBBConnect — Marketplace tutor dan siswa',
    template: '%s | DBBConnect',
  },
  description:
    'Cari tutor terverifikasi, jadwalkan sesi, dan kelola pembayaran dalam satu platform.',
  applicationName: 'DBBConnect',
  authors: [{ name: 'DBBConnect' }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='id'>
      <body className='antialiased'>{children}</body>
    </html>
  );
}
