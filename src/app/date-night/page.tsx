import type { Metadata } from 'next';
import { getCityConfig } from '@/lib/get-city';
import { createClient } from '@/lib/supabase/server';
import CollectionPage from '@/components/CollectionPage';
import { JsonLd, breadcrumbSchema } from '@/lib/structured-data';
import type { Business } from '@/lib/types';

export async function generateMetadata(): Promise<Metadata> {
  const city = await getCityConfig();
  return {
    title: `Date Night in ${city.name}`,
    description: `The best date night ideas in ${city.name} — romantic restaurants, bars, experiences and more.`,
    alternates: { canonical: `https://${city.domain}/date-night` },
  };
}

const FILTERS = [
  { label: 'Restaurant', value: 'restaurant' },
  { label: 'Bar', value: 'bar' },
  { label: 'Wine Bar', value: 'wine' },
  { label: 'Experience', value: 'experience' },
  { label: 'Rooftop', value: 'rooftop' },
];

export default async function DateNightPage() {
  const city = await getCityConfig();
  const supabase = createClient();

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('city', city.slug)
    .contains('tags', ['date-night'])
    .order('admin_priority', { ascending: false });

  const bizList = (businesses ?? []) as Business[];

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: city.fullName, url: `https://${city.domain}` },
        { name: 'Date Night', url: `https://${city.domain}/date-night` },
      ])} />
      <CollectionPage
        businesses={bizList}
        filters={FILTERS}
        title="Date Night"
        eyebrow={`💑 Romance in ${city.name}`}
        sub={`The best date night spots in ${city.name} — romantic restaurants, bars and experiences.`}
      />
    </>
  );
}
