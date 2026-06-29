import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import ApprovalsClient from './ApprovalsClient';

export const metadata: Metadata = { title: 'Admin — Approvals' };

export default async function AdminApprovalsPage() {
  const supabase = createClient();
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('approved', false)
    .order('created_at', { ascending: false });

  return (
    <div className="admin-page">
      <h1 className="admin-page__title">Pending Approvals</h1>
      <ApprovalsClient articles={articles ?? []} />
    </div>
  );
}
