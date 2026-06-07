import { notFound } from 'next/navigation';
import { ColorSwatches } from './components/color-swatches';
import { TypographyShowcase } from './components/typography-showcase';
import { ComponentsShowcase } from './components/components-showcase';
import { StatusShowcase } from './components/status-showcase';
import { AnimationShowcase } from './components/animation-showcase';

export default function SandboxPage() {
  if (process.env.NEXT_PUBLIC_SHOW_SANDBOX !== 'true') notFound();

  return (
    <div className='min-h-screen bg-background'>
      <header className='border-b'>
        <div className='layout flex items-center justify-between py-4'>
          <h1 className='h3'>DBBConnect Sandbox</h1>
          <nav className='flex gap-4 text-sm'>
            <a className='animated-underline' href='#colors'>
              Colors
            </a>
            <a className='animated-underline' href='#typography'>
              Typography
            </a>
            <a className='animated-underline' href='#components'>
              Components
            </a>
            <a className='animated-underline' href='#status'>
              Status
            </a>
            <a className='animated-underline' href='#animation'>
              Animation
            </a>
          </nav>
        </div>
      </header>

      <main className='layout space-y-16 py-12'>
        <Section id='colors' title='Brand colors (indigo scale)'>
          <ColorSwatches />
        </Section>

        <Section id='typography' title='Typography'>
          <TypographyShowcase />
        </Section>

        <Section id='components' title='Components'>
          <ComponentsShowcase />
        </Section>

        <Section id='status' title='Status badges'>
          <StatusShowcase />
        </Section>

        <Section id='animation' title='Animation'>
          <AnimationShowcase />
        </Section>
      </main>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className='scroll-mt-20'>
      <h2 className='h2 mb-6 border-b pb-2'>{title}</h2>
      {children}
    </section>
  );
}
