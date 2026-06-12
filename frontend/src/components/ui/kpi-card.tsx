import * as React from 'react';
import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  unit?: string;
  sublabel?: React.ReactNode;
  trend?: number;
  loading?: boolean;
  accent?: 'primary' | 'emerald' | 'amber' | 'sky' | 'rose';
  className?: string;
}

const ACCENT: Record<
  NonNullable<KpiCardProps['accent']>,
  { bg: string; text: string; ring: string }
> = {
  primary: {
    bg: 'bg-primary-100',
    text: 'text-primary-700',
    ring: 'ring-primary-200/60',
  },
  emerald: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    ring: 'ring-emerald-200/60',
  },
  amber: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    ring: 'ring-amber-200/60',
  },
  sky: { bg: 'bg-sky-100', text: 'text-sky-700', ring: 'ring-sky-200/60' },
  rose: { bg: 'bg-rose-100', text: 'text-rose-700', ring: 'ring-rose-200/60' },
};

export function KpiCard({
  icon: Icon,
  label,
  value,
  unit,
  sublabel,
  trend,
  loading,
  accent = 'primary',
  className,
}: KpiCardProps) {
  const a = ACCENT[accent];
  return (
    <Card
      className={cn(
        'group hover:shadow-primary-500/5 transition-all hover:-translate-y-0.5 hover:shadow-md',
        className,
      )}
    >
      <CardContent className='space-y-3 pt-6'>
        <div className='flex items-start justify-between'>
          <div
            className={cn(
              'rounded-lg p-2 ring-1 transition-transform group-hover:scale-110',
              a.bg,
              a.text,
              a.ring,
            )}
          >
            <Icon className='size-5' />
          </div>
          {typeof trend === 'number' ? (
            <span
              className={cn(
                'mono inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium',
                trend >= 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-700',
              )}
            >
              {trend >= 0 ? (
                <TrendingUp className='size-3' />
              ) : (
                <TrendingDown className='size-3' />
              )}
              {Math.abs(trend).toFixed(0)}%
            </span>
          ) : null}
        </div>
        <div>
          <div className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
            {label}
          </div>
          <div className='mono text-primary-900 mt-1 text-2xl font-bold'>
            {loading ? <span className='opacity-40'>—</span> : value}
            {unit ? (
              <span className='text-muted-foreground ml-1 text-sm font-normal'>
                {unit}
              </span>
            ) : null}
          </div>
          {sublabel ? (
            <div className='text-muted-foreground mono mt-1 text-[11px] tabular-nums'>
              {sublabel}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
