export function AnimationShowcase() {
  return (
    <div className='grid gap-4 md:grid-cols-3'>
      <div className='space-y-2 rounded-md border p-4'>
        <div className='text-muted-foreground text-xs'>animated-underline</div>
        <a className='animated-underline inline-block' href='#'>
          Hover atau fokus saya
        </a>
      </div>
      <div className='space-y-2 rounded-md border p-4'>
        <div className='text-muted-foreground text-xs'>animate-flicker</div>
        <div
          className='inline-block rounded-md bg-amber-400 px-3 py-1 text-sm font-medium text-black'
          style={{ animation: 'var(--animate-flicker)' }}
        >
          NEON
        </div>
      </div>
      <div className='space-y-2 rounded-md border p-4'>
        <div className='text-muted-foreground text-xs'>animate-shimmer</div>
        <div
          className='h-6 w-full rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:700px_100%]'
          style={{ animation: 'var(--animate-shimmer)' }}
        />
      </div>
    </div>
  );
}
