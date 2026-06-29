import type { Metadata } from 'next';
import { getCityConfig } from '@/lib/get-city';
import { createClient } from '@/lib/supabase/server';
import CollectionPage from '@/components/CollectionPage';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/lib/structured-data';
import type { Business } from '@/lib/types';

export async function generateMetadata(): Promise<Metadata> {
  const city = await getCityConfig();
  return {
    title: `Where to Drink in ${city.name}`,
    description: `Find the best bars, wine bars, breweries and cocktail lounges in ${city.name}.`,
    alternates: { canonical: `https://${city.domain}/drink` },
  };
}

const FILTERS = [
  { label: 'Bar', value: 'bar' },
  { label: 'Wine Bar', value: 'wine' },
  { label: 'Cocktails', value: 'cocktails' },
  { label: 'Brewery', value: 'brewery' },
  { label: 'Pub', value: 'pub' },
  { label: 'Rooftop', value: 'rooftop' },
  { label: 'Whisky', value: 'whisky' },
];

export default async function DrinkPage() {
  const city = await getCityConfig();
  const supabase = createClient();

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('city', city.slug)
    .eq('section', 'drink')
    .order('admin_priority', { ascending: false })
    .order('name');

  const bizList = (businesses ?? []) as Business[];

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: city.fullName, url: `https://${city.domain}` },
        { name: 'Where to Drink', url: `https://${city.domain}/drink` },
      ])} />
      <JsonLd data={itemListSchema(
        `Bars & Venues in ${city.name}`,
        `https://${city.domain}/drink`,
        bizList.slice(0, 20).map(b => ({
          name: b.name,
          url: `https://${city.domain}/${b.slug ?? `listing?id=${b.id}`}`,
        }))
      )} />
      <CollectionPage
        businesses={bizList}
        filters={FILTERS}
        title="Where to Drink"
        eyebrow={`🍺 ${city.name}'s bar scene`}
        sub={`From craft breweries to rooftop bars — the best places to drink in ${city.name}.`}
      />
    </>
  );
}
