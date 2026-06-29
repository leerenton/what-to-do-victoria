import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import AdminApprovalsClient from './AdminApprovalsClient';

export const metadata: Metadata = { title: 'Admin — Promotions' };

export default async function AdminPromotionsPage() {
  const supabase = createClient();
  const { data: promotions } = await supabase
    .from('promotions')
    .select('*, businesses(name)')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">Promotions</h1>
        <span className="admin-page__count">{promotions?.length ?? 0} total</span>
      </div>
      <AdminApprovalsClient promotions={promotions ?? []} />
    </div>
  );
}
