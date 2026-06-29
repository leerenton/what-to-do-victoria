import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCityConfig } from '@/lib/get-city';
import { createClient } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'Business Dashboard',
  robots: { index: false, follow: false },
};

export default async function BusinessDashboardPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login?next=/business-dashboard');

  const city = await getCityConfig();

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', session.user.id);

  const bizList = businesses ?? [];
  if (bizList.length === 0) redirect('/business-signup');

  const selectedBiz = bizList[0];

  const [{ data: events }, { data: promos }, { data: inquiries }, { data: promotions }] = await Promise.all([
    supabase.from('events').select('*').eq('business_id', selectedBiz.id).order('date', { ascending: false }).limit(20),
    supabase.from('promos').select('*').eq('business_id', selectedBiz.id),
    supabase.from('inquiries').select('*').eq('business_id', selectedBiz.id).order('created_at', { ascending: false }).limit(20),
    supabase.from('promotions').select('*').eq('business_id', selectedBiz.id).order('created_at', { ascending: false }).limit(10),
  ]);

  return (
    <DashboardClient
      city={city}
      businesses={bizList}
      selectedBiz={selectedBiz}
      events={events ?? []}
      promos={promos ?? []}
      inquiries={inquiries ?? []}
      promotions={promotions ?? []}
    />
  );
}
