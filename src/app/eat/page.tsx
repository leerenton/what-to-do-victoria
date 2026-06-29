import type { Metadata } from 'next';
import { getCityConfig } from '@/lib/get-city';
import { createClient } from '@/lib/supabase/server';
import CollectionPage from '@/components/CollectionPage';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/lib/structured-data';
import type { Business } from '@/lib/types';

export async function generateMetadata(): Promise<Metadata> {
  const city = await getCityConfig();
  return {
    title: `Where to Eat in ${city.name}`,
    description: `Discover the best restaurants, cafés, bars and eateries in ${city.name}. Browse by type and find your next favourite spot.`,
    alternates: { canonical: `https://${city.domain}/eat` },
  };
}

const FILTERS = [
  { label: 'Café', value: 'café' },
  { label: 'Restaurant', value: 'restaurant' },
  { label: 'Brunch', value: 'brunch' },
  { label: 'Bar', value: 'bar' },
  { label: 'Bakery', value: 'bakery' },
  { label: 'Pizza', value: 'pizza' },
  { label: 'Asian', value: 'asian' },
  { label: 'Pub', value: 'pub' },
  { label: 'Takeaway', value: 'takeaway' },
];

export default async function EatPage() {
  const city = await getCityConfig();
  const supabase = createClient();

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('city', city.slug)
    .eq('section', 'eat')
    .order('admin_priority', { ascending: false })
    .order('name');

  const bizList = (businesses ?? []) as Business[];

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: city.fullName, url: `https://${city.domain}` },
        { name: 'Where to Eat', url: `https://${city.domain}/eat` },
      ])} />
      <JsonLd data={itemListSchema(
        `Restaurants & Cafés in ${city.name}`,
        `https://${city.domain}/eat`,
        bizList.slice(0, 20).map(b => ({
          name: b.name,
          url: `https://${city.domain}/${b.slug ?? `listing?id=${b.id}`}`,
        }))
      )} />
      <CollectionPage
        businesses={bizList}
        filters={FILTERS}
        title="Where to Eat"
        eyebrow={`🍽️ ${city.name}'s food scene`}
        sub={`From waterfront dining to hidden-gem cafés — discover ${city.name}'s best bites.`}
      />
    </>
  );
}
