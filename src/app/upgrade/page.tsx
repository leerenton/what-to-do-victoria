import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCityConfig } from '@/lib/get-city';
import { createClient } from '@/lib/supabase/server';
import UpgradeClient from './UpgradeClient';

export const metadata: Metadata = {
  title: 'Gold Membership',
  description: 'Upgrade to Gold — unlock enquiries, homepage placement, promoted events and more.',
};

export default async function UpgradePage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login?next=/upgrade');

  const city = await getCityConfig();

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, is_gold, plan')
    .eq('owner_id', session.user.id)
    .eq('city', city.slug);

  return <UpgradeClient city={city} businesses={businesses ?? []} />;
}
