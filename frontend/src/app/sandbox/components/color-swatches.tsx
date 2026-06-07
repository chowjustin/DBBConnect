const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

const HEX_MAP: Record<(typeof SHADES)[number], string> = {
  50: '#eef2ff',
  100: '#e0e7ff',
  200: '#c7d2fe',
  300: '#a5b4fc',
  400: '#818cf8',
  500: '#6366f1',
  600: '#4f46e5',
  700: '#4338ca',
  800: '#3730a3',
  900: '#312e81',
  950: '#1e1b4b',
};

const SEMANTIC = [
  { name: 'background', cls: 'bg-background text-foreground border' },
  { name: 'foreground', cls: 'bg-foreground text-background' },
  { name: 'card', cls: 'bg-card text-card-foreground border' },
  { name: 'popover', cls: 'bg-popover text-popover-foreground border' },
  { name: 'primary', cls: 'bg-primary text-primary-foreground' },
  { name: 'secondary', cls: 'bg-secondary text-secondary-foreground' },
  { name: 'muted', cls: 'bg-muted text-muted-foreground' },
  { name: 'accent', cls: 'bg-accent text-accent-foreground' },
  { name: 'destructive', cls: 'bg-destructive text-destructive-foreground' },
  { name: 'border', cls: 'bg-border text-foreground' },
  { name: 'sidebar', cls: 'bg-sidebar text-sidebar-foreground border' },
];

export function ColorSwatches() {
  return (
    <div className='space-y-8'>
      <div>
        <h3 className='h4 mb-3'>Primary scale</h3>
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-11'>
          {SHADES.map((shade) => (
            <div
              key={shade}
              className='rounded-md border'
              style={{ backgroundColor: `var(--color-primary-${shade})` }}
            >
              <div className='h-16 rounded-t-md' />
              <div className='space-y-0.5 bg-white p-2 text-xs'>
                <div className='font-semibold'>primary-{shade}</div>
                <div className='text-muted-foreground'>{HEX_MAP[shade]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className='h4 mb-3'>Semantic tokens</h3>
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
          {SEMANTIC.map(({ name, cls }) => (
            <div
              key={name}
              className={`flex h-20 items-center justify-center rounded-md text-xs font-medium ${cls}`}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
