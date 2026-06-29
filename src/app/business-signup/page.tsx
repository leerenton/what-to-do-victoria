import type { Metadata } from 'next';
import { getCityConfig } from '@/lib/get-city';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import BusinessSignupClient from './BusinessSignupClient';

export const metadata: Metadata = {
  title: 'List Your Business',
  description: 'Add your business to What To Do and reach locals planning their next outing.',
};

export default async function BusinessSignupPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login?next=/business-signup');

  const city = await getCityConfig();
  return <BusinessSignupClient city={city} userId={session.user.id} />;
}
