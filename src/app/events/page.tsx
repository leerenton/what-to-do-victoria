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

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const pastCutoff = thirtyDaysAgo.toISOString().split('T')[0];

  const [{ data: events }, { data: past }] = await Promise.all([
    supabase.from('events').select('*').eq('city', city.slug).gte('date', now)
      .order('admin_priority', { ascending: false }).order('date').limit(80),
    supabase.from('events').select('*').eq('city', city.slug).gte('date', pastCutoff).lt('date', now)
      .order('date', { ascending: false }).limit(30),
  ]);

  const eventList     = (events ?? []) as Event[];
  const pastEventList = (past ?? []) as Event[];

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: city.fullName, url: `https://${city.domain}` },
        { name: 'Events', url: `https://${city.domain}/events` },
      ])} />
      <JsonLd data={itemListSchema(
        `Events in ${city.name}`,
        `https://${city.domain}/events`,
        eventList.slice(0, 20).map(e => ({ name: e.title, url: `https://${city.domain}/events/${e.id}` }))
      )} />
      {eventList.slice(0, 10).map(e => (
        <JsonLd key={e.id} data={eventSchema(e, city)} />
      ))}

      <div className="coll-hero coll-hero--events">
        <div className="coll-hero__inner container">
          <p className="coll-hero__eyebrow">📅 What&apos;s happening</p>
          <h1 className="coll-hero__title">Events in {city.name}</h1>
          <p className="coll-hero__sub">Music, markets, arts, sport and more — your guide to what&apos;s on right now.</p>
        </div>
      </div>

      <EventsClient events={eventList} pastEvents={pastEventList} cityName={city.name} />
    </>
  );
}
