import type { Metadata } from 'next';
import { getCityConfig } from '@/lib/get-city';
import { createClient } from '@/lib/supabase/server';
import { JsonLd, breadcrumbSchema, itemListSchema, eventSchema } from '@/lib/structured-data';
import EventsClient from './EventsClient';
import type { Event } from '@/lib/types';

export async function generateMetadata(): Promise<Metadata> {
  const city = await getCityConfig();
  return {
    title: `Events in ${city.name}`,
    description: `Discover upcoming events, festivals, gigs, markets and things to do in ${city.name}. Find what's on this weekend.`,
    alternates: { canonical: `https://${city.domain}/events` },
  };
}

export default async function EventsPage() {
  const city = await getCityConfig();
  const supabase = createClient();
  const now = new Date().toISOString().split('T')[0];

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('city', city.slug)
    .gte('date', now)
    .order('is_promoted', { ascending: false })
    .order('date')
    .limit(60);

  const eventList = (events ?? []) as Event[];

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: city.fullName, url: `https://${city.domain}` },
        { name: 'Events', url: `https://${city.domain}/events` },
      ])} />
      <JsonLd data={itemListSchema(
        `Events in ${city.name}`,
        `https://${city.domain}/events`,
        eventList.slice(0, 20).map(e => ({
          name: e.title,
          url: `https://${city.domain}/events/${e.id}`,
        }))
      )} />
      {eventList.slice(0, 10).map(e => (
        <JsonLd key={e.id} data={eventSchema(e, city)} />
      ))}

      <div className="coll-hero">
        <div className="coll-hero__inner container">
          <p className="coll-hero__eyebrow">📅 What&apos;s on in {city.name}</p>
          <h1 className="coll-hero__title">Events</h1>
          <p className="coll-hero__sub">Festivals, gigs, markets, sport and more — find what&apos;s on in {city.name}.</p>
        </div>
      </div>

      <EventsClient events={eventList} cityName={city.name} />
    </>
  );
}
