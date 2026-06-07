import { IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { buildMetadata } from '@/config/seo';

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = buildMetadata({
  title: 'Marketplace tutor dan siswa',
  path: '/',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='id' className={plexMono.variable}>
      <body className='antialiased'>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
