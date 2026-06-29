import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getCityConfig } from '@/lib/get-city';
import { createClient } from '@/lib/supabase/server';
import AccountClient from './AccountClient';

export const metadata: Metadata = {
  title: 'My Account',
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect('/login?next=/account');

  const city = await getCityConfig();

  const [{ data: savedItems }, { data: businesses }, { data: subs }] = await Promise.all([
    supabase.from('saved_items').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
    supabase.from('businesses').select('id, name, slug, plan, is_gold').eq('owner_id', session.user.id),
    supabase.from('user_city_subscriptions').select('city, subscribed').eq('user_id', session.user.id),
  ]);

  return (
    <AccountClient
      user={session.user}
      city={city}
      savedItems={savedItems ?? []}
      businesses={businesses ?? []}
      citySubscriptions={subs ?? []}
    />
  );
}
