import { SubscriptionCard } from '@/components/subscription-card';

export default function TutorSubscriptionPage() {
  return (
    <div className='space-y-4'>
      <h1 className='h2'>Langganan</h1>
      <SubscriptionCard
        tier='PRO_TUTOR'
        description='Komisi lebih rendah, analitik lengkap, badge Pro.'
      />
    </div>
  );
}
