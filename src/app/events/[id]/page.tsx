import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCityConfig } from '@/lib/get-city';
import { createClient } from '@/lib/supabase/server';
import { JsonLd, eventSchema, breadcrumbSchema } from '@/lib/structured-data';
import type { Event, Business } from '@/lib/types';

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = await getCityConfig();
  const supabase = createClient();
  const { data: event } = await supabase.from('events').select('title, description, img, date, location').eq('id', Number(params.id)).single();
  if (!event) return { title: 'Event not found' };
  return {
    title: `${event.title} — ${city.name}`,
    description: event.description ?? `${event.title} in ${event.location ?? city.name}${event.date ? ` on ${event.date}` : ''}.`,
    openGraph: { images: event.img ? [{ url: event.img }] : [] },
    alternates: { canonical: `https://${city.domain}/events/${params.id}` },
  };
}

export default async function EventPage({ params }: Props) {
  const city = await getCityConfig();
  const supabase = createClient();

  const { data: event } = await supabase.from('events').select('*').eq('id', Number(params.id)).single();
  if (!event) notFound();

  const e = event as Event;

  const { data: business } = e.business_id
    ? await supabase.from('businesses').select('id, name, slug, img, type').eq('id', e.business_id).single()
    : { data: null };

  // Related events (same category)
  const { data: related } = await supabase
    .from('events')
    .select('id, title, date, img, color, emoji, category, location')
    .eq('city', city.slug)
    .eq('category', e.category ?? '')
    .neq('id', e.id)
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date')
    .limit(3);

  return (
    <>
      <JsonLd data={eventSchema(e, city)} />
      <JsonLd data={breadcrumbSchema([
        { name: city.fullName, url: `https://${city.domain}` },
        { name: 'Events', url: `https://${city.domain}/events` },
        { name: e.title, url: `https://${city.domain}/events/${e.id}` },
      ])} />

      {/* Hero */}
      <div className="listing-hero">
        {e.img ? (
          <Image src={e.img} alt={e.title} fill priority sizes="100vw" className="listing-hero__img" />
        ) : (
          <div className="listing-hero__placeholder" style={{ background: e.color ?? '#e2e8f0' }}>
            <span className="listing-hero__emoji">{e.emoji ?? '📅'}</span>
          </div>
        )}
      </div>

      <div className="listing-body container">
        <div className="listing-main">

          <div className="listing-header">
            {e.category && <span className="listing-header__type">{e.category}</span>}
            <h1 className="listing-header__name">{e.title}</h1>

            <div className="event-detail__meta">
              {e.date && (
                <div className="event-detail__meta-row">
                  <span className="material-symbols-rounded">calendar_today</span>
                  <span>{e.date}{e.time ? ` · ${e.time}` : ''}</span>
                </div>
              )}
              {e.location && (
                <div className="event-detail__meta-row">
                  <span className="material-symbols-rounded">location_on</span>
                  <span>{e.location}</span>
                </div>
              )}
              {e.price && (
                <div className="event-detail__meta-row">
                  <span className="material-symbols-rounded">payments</span>
                  <span>{e.price}</span>
                </div>
              )}
            </div>

            <div className="listing-header__actions">
              {e.url && (
                <a href={e.url} target="_blank" rel="noreferrer noopener" className="btn btn--primary">
                  Get Tickets
                </a>
              )}
            </div>
          </div>

          {e.description && (
            <section className="listing-section">
              <p className="listing-desc">{e.description}</p>
            </section>
          )}

          {business && (
            <section className="listing-section">
              <h2 className="listing-section__title">Presented by</h2>
              <Link href={business.slug ? `/${business.slug}` : `/listing?id=${business.id}`} className="event-organiser">
                {(business as Business).img && (
                  <Image src={(business as Business).img!} alt={business.name} width={48} height={48} className="event-organiser__img" />
                )}
                <div>
                  <p className="event-organiser__name">{business.name}</p>
                  <p className="event-organiser__type">{business.type}</p>
                </div>
              </Link>
            </section>
          )}

          {/* Related events */}
          {(related ?? []).length > 0 && (
            <section className="listing-section">
              <h2 className="listing-section__title">More {e.category} Events</h2>
              <div className="related-events">
                {(related ?? []).map((r: any) => (
                  <Link key={r.id} href={`/events/${r.id}`} className="related-event-card">
                    {r.img
                      ? <Image src={r.img} alt={r.title} fill sizes="200px" className="related-event-card__img" />
                      : <div className="related-event-card__placeholder" style={{ background: r.color ?? '#e2e8f0' }}>{r.emoji ?? '📅'}</div>
                    }
                    <div className="related-event-card__body">
                      <p className="related-event-card__title">{r.title}</p>
                      <p className="related-event-card__date">{r.date}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
