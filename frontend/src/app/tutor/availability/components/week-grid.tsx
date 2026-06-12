'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] as const;
const START_HOUR = 6;
const END_HOUR = 22;
const SLOT_MIN = 15;
const ROWS = ((END_HOUR - START_HOUR) * 60) / SLOT_MIN;

interface SlotRange {
  dayOfWeek: number;
  startMin: number;
  endMin: number;
}

interface Props {
  value: SlotRange[];
  onChange: (slots: SlotRange[]) => void;
}

function buildGrid(value: SlotRange[]): boolean[][] {
  const grid: boolean[][] = Array.from({ length: 7 }, () =>
    Array(ROWS).fill(false),
  );
  for (const s of value) {
    if (s.dayOfWeek < 0 || s.dayOfWeek > 6) continue;
    const startIdx = Math.max(0, (s.startMin - START_HOUR * 60) / SLOT_MIN);
    const endIdx = Math.min(ROWS, (s.endMin - START_HOUR * 60) / SLOT_MIN);
    for (let i = startIdx; i < endIdx; i++) grid[s.dayOfWeek][i] = true;
  }
  return grid;
}

function gridToSlots(grid: boolean[][]): SlotRange[] {
  const out: SlotRange[] = [];
  for (let d = 0; d < 7; d++) {
    let runStart: number | null = null;
    for (let i = 0; i < ROWS; i++) {
      if (grid[d][i] && runStart === null) runStart = i;
      else if (!grid[d][i] && runStart !== null) {
        out.push({
          dayOfWeek: d,
          startMin: START_HOUR * 60 + runStart * SLOT_MIN,
          endMin: START_HOUR * 60 + i * SLOT_MIN,
        });
        runStart = null;
      }
    }
    if (runStart !== null) {
      out.push({
        dayOfWeek: d,
        startMin: START_HOUR * 60 + runStart * SLOT_MIN,
        endMin: START_HOUR * 60 + ROWS * SLOT_MIN,
      });
    }
  }
  return out;
}

function fmtHour(h: number) {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:00 ${ampm}`;
}

export function WeekGrid({ value, onChange }: Props) {
  const [grid, setGrid] = React.useState(() => buildGrid(value));
  const paintingRef = React.useRef<{ mode: boolean } | null>(null);
  const seededRef = React.useRef(false);

  // Re-seed grid when external value changes (e.g. server load).
  React.useEffect(() => {
    if (seededRef.current && value.length === 0) return;
    setGrid(buildGrid(value));
    seededRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(value)]);

  React.useEffect(() => {
    const up = () => {
      paintingRef.current = null;
    };
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, []);

  const apply = (day: number, idx: number, mode: boolean) => {
    setGrid((prev) => {
      if (prev[day][idx] === mode) return prev;
      const next = prev.map((row) => row.slice());
      next[day][idx] = mode;
      queueMicrotask(() => onChange(gridToSlots(next)));
      return next;
    });
  };

  const onCellDown = (day: number, idx: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    const current = grid[day][idx];
    const mode = !current;
    paintingRef.current = { mode };
    apply(day, idx, mode);
  };

  const onCellEnter = (day: number, idx: number) => () => {
    if (!paintingRef.current) return;
    apply(day, idx, paintingRef.current.mode);
  };

  return (
    <div className='select-none'>
      <div className='border-primary-100 inline-block overflow-hidden rounded-lg border bg-white p-3'>
        <div
          className='grid'
          style={{
            gridTemplateColumns: `4.5rem repeat(7, minmax(64px, 1fr))`,
          }}
        >
          {/* header row */}
          <div className='bg-primary-50/50 border-primary-100 border-r border-b' />
          {DAYS.map((d) => (
            <div
              key={d}
              className='bg-primary-50/50 border-primary-100 border-r border-b px-2 py-2 text-center text-xs font-semibold last:border-r-0'
            >
              {d}
            </div>
          ))}

          {/* slot rows */}
          {Array.from({ length: ROWS }).map((_, i) => {
            const min = START_HOUR * 60 + i * SLOT_MIN;
            const hour = Math.floor(min / 60);
            const showLabel = min % 60 === 0;
            return (
              <React.Fragment key={i}>
                <div
                  className={cn(
                    'border-primary-100 mono text-muted-foreground border-r pr-2 text-right text-[10px] tabular-nums',
                    !showLabel && 'invisible',
                  )}
                  style={{ lineHeight: '20px' }}
                >
                  {showLabel ? fmtHour(hour) : ''}
                </div>
                {Array.from({ length: 7 }).map((_, d) => {
                  const filled = grid[d][i];
                  const hourBoundary = (i + 1) % (60 / SLOT_MIN) === 0;
                  return (
                    <button
                      key={d}
                      type='button'
                      onPointerDown={onCellDown(d, i)}
                      onPointerEnter={onCellEnter(d, i)}
                      className={cn(
                        'border-primary-100 h-5 cursor-pointer touch-none border-r last:border-r-0',
                        i === ROWS - 1
                          ? ''
                          : hourBoundary
                            ? 'border-b'
                            : 'border-b-primary-100/40 border-b border-dashed',
                        filled
                          ? 'bg-primary-500 hover:bg-primary-600'
                          : 'hover:bg-primary-50 bg-white',
                      )}
                      aria-label={`${DAYS[d]} ${fmtHour(hour)} ${filled ? 'tersedia' : 'kosong'}`}
                    />
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      <p className='text-muted-foreground mt-2 text-xs'>
        Klik atau tarik untuk menandai jam tersedia. Klik lagi untuk hapus.
      </p>
    </div>
  );
}
