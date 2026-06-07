import { Badge } from '@/components/ui/badge';

const GROUPS = [
  {
    title: 'Application',
    items: [
      { label: 'Menunggu', color: 'bg-amber-100 text-amber-800' },
      { label: 'Diterima', color: 'bg-emerald-100 text-emerald-800' },
      { label: 'Ditolak', color: 'bg-red-100 text-red-800' },
    ],
  },
  {
    title: 'Session',
    items: [
      { label: 'Terjadwal', color: 'bg-blue-100 text-blue-800' },
      { label: 'Selesai', color: 'bg-emerald-100 text-emerald-800' },
      { label: 'Dibatalkan', color: 'bg-gray-200 text-gray-700' },
      { label: 'Tidak Hadir', color: 'bg-red-100 text-red-800' },
    ],
  },
  {
    title: 'Payment',
    items: [
      { label: 'Diperiksa', color: 'bg-amber-100 text-amber-800' },
      { label: 'Diterima', color: 'bg-emerald-100 text-emerald-800' },
      { label: 'Ditolak', color: 'bg-red-100 text-red-800' },
      { label: 'Dikembalikan', color: 'bg-gray-200 text-gray-700' },
    ],
  },
  {
    title: 'Payout',
    items: [
      { label: 'Diproses', color: 'bg-amber-100 text-amber-800' },
      { label: 'Dibayar', color: 'bg-emerald-100 text-emerald-800' },
      { label: 'Ditolak', color: 'bg-red-100 text-red-800' },
    ],
  },
  {
    title: 'Verification',
    items: [
      { label: 'Pending', color: 'bg-amber-100 text-amber-800' },
      { label: 'Verified', color: 'bg-emerald-100 text-emerald-800' },
      { label: 'Rejected', color: 'bg-red-100 text-red-800' },
    ],
  },
];

export function StatusShowcase() {
  return (
    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
      {GROUPS.map((g) => (
        <div key={g.title} className='space-y-2'>
          <h3 className='h4'>{g.title}</h3>
          <div className='flex flex-wrap gap-2'>
            {g.items.map((it) => (
              <Badge key={it.label} className={`${it.color} border-0`}>
                {it.label}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
