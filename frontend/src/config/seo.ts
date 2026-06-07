import type { Metadata } from 'next';

import { siteUrl } from '@/constant/env';

const APP_NAME = 'DBBConnect';
const APP_DESC =
  'Cari tutor terverifikasi, jadwalkan sesi, dan kelola pembayaran dalam satu platform.';

interface BuildMetadataInput {
  title?: string;
  description?: string;
  path?: string;
}

export function buildMetadata({
  title,
  description = APP_DESC,
  path = '/',
}: BuildMetadataInput = {}): Metadata {
  const fullTitle = title ? `${title} | ${APP_NAME}` : APP_NAME;
  const url = `${siteUrl}${path}`;
  return {
    title: fullTitle,
    description,
    applicationName: APP_NAME,
    metadataBase: new URL(siteUrl),
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: APP_NAME,
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
    },
  };
}
