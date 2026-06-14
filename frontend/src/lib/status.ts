import {
  AlertTriangle,
  Ban,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Send,
  Undo2,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

import type {
  ApplicationStatus,
  PaymentStatus,
  PayoutStatus,
  SessionStatus,
  VerificationStatus,
} from '@/types/shared';

export interface StatusMeta {
  label: string;
  className: string;
  dot: string;
  icon: LucideIcon;
}

const AMBER = {
  className:
    'bg-amber-50 text-amber-800 border border-amber-200 ring-1 ring-amber-100/60',
  dot: 'bg-amber-500',
};
const SKY = {
  className:
    'bg-sky-50 text-sky-800 border border-sky-200 ring-1 ring-sky-100/60',
  dot: 'bg-sky-500',
};
const EMERALD = {
  className:
    'bg-emerald-50 text-emerald-800 border border-emerald-200 ring-1 ring-emerald-100/60',
  dot: 'bg-emerald-500',
};
const RED = {
  className:
    'bg-red-50 text-red-800 border border-red-200 ring-1 ring-red-100/60',
  dot: 'bg-red-500',
};
const SLATE = {
  className:
    'bg-slate-50 text-slate-700 border border-slate-200 ring-1 ring-slate-100/60',
  dot: 'bg-slate-400',
};
const ROSE = {
  className:
    'bg-rose-50 text-rose-800 border border-rose-200 ring-1 ring-rose-100/60',
  dot: 'bg-rose-500',
};
const VIOLET = {
  className:
    'bg-violet-50 text-violet-800 border border-violet-200 ring-1 ring-violet-100/60',
  dot: 'bg-violet-500',
};
const BLUE = {
  className:
    'bg-blue-50 text-blue-800 border border-blue-200 ring-1 ring-blue-100/60',
  dot: 'bg-blue-500',
};
/**
 * Money-in-motion: pending payment review, payout in flight, "tersedia ditarik"
 * balance. Reserved for the finance lifecycle states.
 */
const TEAL = {
  className:
    'bg-secondary-50 text-secondary-800 border border-secondary-200 ring-1 ring-secondary-100/60',
  dot: 'bg-secondary-500',
};

export const APPLICATION_STATUS: Record<ApplicationStatus, StatusMeta> = {
  PENDING: { label: 'Menunggu', ...AMBER, icon: Clock },
  ACCEPTED: { label: 'Diterima', ...EMERALD, icon: CheckCircle2 },
  REJECTED: { label: 'Ditolak', ...RED, icon: XCircle },
};

export const SESSION_STATUS: Record<SessionStatus, StatusMeta> = {
  SCHEDULED: { label: 'Terjadwal', ...BLUE, icon: Calendar },
  COMPLETED: { label: 'Selesai', ...EMERALD, icon: CheckCircle2 },
  CANCELED: { label: 'Dibatalkan', ...SLATE, icon: Ban },
  NO_SHOW: { label: 'Tidak Hadir', ...ROSE, icon: AlertTriangle },
};

export const PAYMENT_STATUS: Record<PaymentStatus, StatusMeta> = {
  UNDER_REVIEW: { label: 'Diperiksa', ...SKY, icon: Eye },
  CONFIRMED: { label: 'Diterima', ...EMERALD, icon: CheckCircle2 },
  REJECTED: { label: 'Ditolak', ...RED, icon: XCircle },
  REFUNDED: { label: 'Dikembalikan', ...SLATE, icon: Undo2 },
};

export const PAYOUT_STATUS: Record<PayoutStatus, StatusMeta> = {
  REQUESTED: { label: 'Diproses', ...SKY, icon: Send },
  PAID: { label: 'Dibayar', ...EMERALD, icon: CheckCircle2 },
  REJECTED: { label: 'Ditolak', ...RED, icon: XCircle },
};

export const VERIFICATION_STATUS: Record<VerificationStatus, StatusMeta> = {
  PENDING: { label: 'Menunggu', ...AMBER, icon: Clock },
  VERIFIED: { label: 'Terverifikasi', ...EMERALD, icon: CheckCircle2 },
  REJECTED: { label: 'Ditolak', ...RED, icon: XCircle },
};

export type StatusKind =
  | 'application'
  | 'session'
  | 'payment'
  | 'payout'
  | 'verification';

const MAPS = {
  application: APPLICATION_STATUS,
  session: SESSION_STATUS,
  payment: PAYMENT_STATUS,
  payout: PAYOUT_STATUS,
  verification: VERIFICATION_STATUS,
} as const;

export function getStatusMeta(
  kind: StatusKind,
  status: string,
): StatusMeta | undefined {
  const m = MAPS[kind] as Record<string, StatusMeta>;
  return m[status];
}
