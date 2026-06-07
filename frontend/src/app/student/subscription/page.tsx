import { SubscriptionCard } from '@/components/subscription-card';

export default function StudentSubscriptionPage() {
  return (
    <div className='space-y-4'>
      <h1 className='h2'>Langganan</h1>
      <SubscriptionCard
        tier='PREMIUM_STUDENT'
        description='Akses materi premium, prioritas booking, dukungan langsung.'
      />
    </div>
  );
}
