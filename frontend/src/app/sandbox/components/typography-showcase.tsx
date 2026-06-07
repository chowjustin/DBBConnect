const ROWS = [
  { name: 'h0', cls: 'h0', desc: 'text-3xl md:text-5xl, font-bold' },
  { name: 'h1', cls: 'h1', desc: 'text-2xl md:text-4xl, font-bold' },
  { name: 'h2', cls: 'h2', desc: 'text-xl md:text-3xl, font-bold' },
  { name: 'h3', cls: 'h3', desc: 'text-lg md:text-2xl, font-bold' },
  { name: 'h4', cls: 'h4', desc: 'text-base md:text-lg, font-bold' },
  { name: 'p', cls: 'p', desc: 'text-sm md:text-base' },
];

export function TypographyShowcase() {
  return (
    <div className='space-y-4'>
      {ROWS.map(({ name, cls, desc }) => (
        <div
          key={name}
          className='grid grid-cols-[6rem_1fr_auto] items-baseline gap-4 border-b pb-3'
        >
          <code className='text-muted-foreground text-xs'>.{name}</code>
          <div className={cls}>The quick brown fox lompat melewati anjing</div>
          <span className='text-muted-foreground text-xs'>{desc}</span>
        </div>
      ))}
    </div>
  );
}
