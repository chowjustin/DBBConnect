import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { buildMetadata } from '@/config/seo';

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
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
    <html lang='id' className={jetbrains.variable}>
      <body className='antialiased'>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
