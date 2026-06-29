import type { Metadata } from 'next';
import { getCityConfig } from '@/lib/get-city';
import { createClient } from '@/lib/supabase/server';
import CollectionPage from '@/components/CollectionPage';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/lib/structured-data';
import type { Business } from '@/lib/types';

export async function generateMetadata(): Promise<Metadata> {
  const city = await getCityConfig();
  return {
    title: `Things To Do in ${city.name}`,
    description: `Discover the best things to do in ${city.name} — attractions, activities, sport, arts, family fun and more.`,
    alternates: { canonical: `https://${city.domain}/do` },
  };
}

const FILTERS = [
  { label: 'Attractions', value: 'attraction' },
  { label: 'Activities', value: 'activity' },
  { label: 'Adventure', value: 'adventure' },
  { label: 'Arts & Culture', value: 'arts' },
  { label: 'Sport', value: 'sport' },
  { label: 'Outdoors', value: 'outdoors' },
  { label: 'Family', value: 'family' },
  { label: 'Wellness', value: 'wellness' },
];

export default async function DoPage() {
  const city = await getCityConfig();
  const supabase = createClient();

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('city', city.slug)
    .eq('section', 'do')
    .order('admin_priority', { ascending: false })
    .order('name');

  const bizList = (businesses ?? []) as Business[];

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: city.fullName, url: `https://${city.domain}` },
        { name: 'Things To Do', url: `https://${city.domain}/do` },
      ])} />
      <JsonLd data={itemListSchema(
        `Things To Do in ${city.name}`,
        `https://${city.domain}/do`,
        bizList.slice(0, 20).map(b => ({
          name: b.name,
          url: `https://${city.domain}/${b.slug ?? `listing?id=${b.id}`}`,
        }))
      )} />
      <CollectionPage
        businesses={bizList}
        filters={FILTERS}
        title="Things To Do"
        eyebrow={`🎯 Explore ${city.name}`}
        sub={`Attractions, adventures, sport and more — the best things to do in ${city.name}.`}
      />
    </>
  );
}
