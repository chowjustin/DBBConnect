'use client';

import { MessageCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { whatsappLink } from '@/lib/whatsapp';

interface Props {
  phone: string | null | undefined;
  message?: string;
  label?: string;
  size?: 'sm' | 'default' | 'icon-sm';
}

export function WhatsAppButton({
  phone,
  message,
  label = 'WhatsApp',
  size = 'sm',
}: Props) {
  const href = whatsappLink(phone, message);
  if (!href) return null;
  return (
    <Button
      asChild
      size={size === 'icon-sm' ? 'icon-sm' : size}
      variant='outline'
      className='border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900'
    >
      <a
        href={href}
        target='_blank'
        rel='noopener noreferrer'
        aria-label={label}
      >
        <MessageCircle className='size-3.5' />
        {size !== 'icon-sm' ? label : null}
      </a>
    </Button>
  );
}
