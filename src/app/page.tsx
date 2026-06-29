import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getCityConfig } from '@/lib/get-city';
import { createClient } from '@/lib/supabase/server';
import { JsonLd, websiteSchema, itemListSchema, eventSchema } from '@/lib/structured-data';
import type { Event, Business, Article } from '@/lib/types';

export async function generateMetadata(): Promise<Metadata> {
  const city = await getCityConfig();
  return {
    title: `${city.fullName} — Events, Restaurants & Things To Do in ${city.name}`,
    description: `Your local guide to ${city.name} — discover events, restaurants, cafes, bars, hotels and things to do. Updated weekly.`,
    openGraph: {
      url: `https://${city.domain}`,
      images: [{ url: `https://${city.domain}/assets/og-default.jpg` }],
    },
    alternates: { canonical: `https://${city.domain}` },
  };
}

export default async function HomePage() {
  const city = await getCityConfig();
  const supabase = createClient();

  const now = new Date().toISOString().split('T')[0];

  const [
    { data: featuredEvents },
    { data: upcomingEvents },
    { data: eatBusinesses },
    { data: drinkBusinesses },
    { data: doBusinesses },
    { data: articles },
  ] = await Promise.all([
    supabase.from('events').select('*').eq('city', city.slug).eq('featured', true).gte('date', now).order('date').limit(3),
    supabase.from('events').select('*').eq('city', city.slug).gte('date', now).order('date').limit(6),
    supabase.from('businesses').select('*').eq('city', city.slug).eq('section', 'eat').order('admin_priority', { ascending: false }).limit(6),
    supabase.from('businesses').select('*').eq('city', city.slug).eq('section', 'drink').order('admin_priority', { ascending: false }).limit(6),
    supabase.from('businesses').select('*').eq('city', city.slug).eq('section', 'do').order('admin_priority', { ascending: false }).limit(6),
    supabase.from('articles').select('*').eq('approved', true).order('published_at', { ascending: false }).limit(3),
  ]);

  const heroEvents = featuredEvents ?? [];
  const [mainHero, ...sideHeroes] = heroEvents;

  return (
    <>
      {/* Structured data */}
      <JsonLd data={websiteSchema(city)} />
      {upcomingEvents && upcomingEvents.length > 0 && (
        <JsonLd data={itemListSchema(
          `Events in ${city.name}`,
          `https://${city.domain}/events`,
          upcomingEvents.map(e => ({
            name: e.title,
            url: `https://${city.domain}/events/${e.id}`,
          }))
        )} />
      )}
      {featuredEvents && featuredEvents.map(e => (
        <JsonLd key={e.id} data={eventSchema(e as Event, city)} />
      ))}

      {/* Hero */}
      {heroEvents.length > 0 && (
        <section className="masonry-hero container">
          <div className="masonry-hero__grid">
            {mainHero && (
              <Link href={`/events/${mainHero.id}`} className="masonry-hero__main">
                <div className="masonry-hero__img-wrap">
                  {mainHero.img && (
                    <Image src={mainHero.img} alt={mainHero.title} fill className="masonry-hero__img" sizes="(max-width: 640px) 100vw, 60vw" priority />
                  )}
                  <div className="masonry-hero__overlay" style={{ background: mainHero.color ?? undefined }} />
                </div>
                <div className="masonry-hero__info">
                  <span className="masonry-hero__badge">{mainHero.category ?? 'Event'}</span>
                  <h2 className="masonry-hero__title">{mainHero.title}</h2>
                  <p className="masonry-hero__sub">{mainHero.date} {mainHero.location ? `· ${mainHero.location}` : ''}</p>
                </div>
              </Link>
            )}
            <div className="masonry-hero__stack">
              {sideHeroes.slice(0, 2).map(e => (
                <Link key={e.id} href={`/events/${e.id}`} className="masonry-hero__small">
                  <div className="masonry-hero__img-wrap">
                    {e.img && <Image src={e.img} alt={e.title} fill className="masonry-hero__img" sizes="(max-width: 640px) 100vw, 40vw" />}
                    <div className="masonry-hero__overlay" style={{ background: e.color ?? undefined }} />
                  </div>
                  <div className="masonry-hero__info">
                    <span className="masonry-hero__badge">{e.category ?? 'Event'}</span>
                    <h3 className="masonry-hero__title masonry-hero__title--sm">{e.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming events */}
      <section className="page-section container" aria-label="Upcoming events">
        <div className="section-header">
          <h2 className="section-title"><span className="material-symbols-rounded">event</span> Coming Up in {city.name}</h2>
          <Link href="/events" className="section-link">See all events →</Link>
        </div>
        <div className="event-grid">
          {(upcomingEvents ?? []).map(event => (
            <EventCard key={event.id} event={event as Event} city={city.slug} />
          ))}
        </div>
      </section>

      {/* Eat section */}
      {(eatBusinesses ?? []).length > 0 && (
        <section className="page-section container" aria-label="Where to eat">
          <div className="section-header">
            <h2 className="section-title"><span className="material-symbols-rounded">restaurant</span> Where to Eat</h2>
            <Link href="/eat" className="section-link">See all →</Link>
          </div>
          <div className="biz-grid">
            {(eatBusinesses ?? []).map(biz => (
              <BusinessCard key={biz.id} biz={biz as Business} />
            ))}
          </div>
        </section>
      )}

      {/* Drink section */}
      {(drinkBusinesses ?? []).length > 0 && (
        <section className="page-section container" aria-label="Where to drink">
          <div className="section-header">
            <h2 className="section-title"><span className="material-symbols-rounded">local_bar</span> Where to Drink</h2>
            <Link href="/drink" className="section-link">See all →</Link>
          </div>
          <div className="biz-grid">
            {(drinkBusinesses ?? []).map(biz => (
              <BusinessCard key={biz.id} biz={biz as Business} />
            ))}
          </div>
        </section>
      )}

      {/* Do section */}
      {(doBusinesses ?? []).length > 0 && (
        <section className="page-section container" aria-label="Things to do">
          <div className="section-header">
            <h2 className="section-title"><span className="material-symbols-rounded">explore</span> Things To Do</h2>
            <Link href="/do" className="section-link">See all →</Link>
          </div>
          <div className="biz-grid">
            {(doBusinesses ?? []).map(biz => (
              <BusinessCard key={biz.id} biz={biz as Business} />
            ))}
          </div>
        </section>
      )}

      {/* Articles / Guides strip */}
      {(articles ?? []).length > 0 && (
        <section className="page-section container" aria-label="Local guides">
          <div className="section-header">
            <h2 className="section-title"><span className="material-symbols-rounded">map</span> Local Guides</h2>
            <Link href="/guides" className="section-link">See all →</Link>
          </div>
          <div className="guide-grid">
            {(articles ?? []).map(article => (
              <ArticleCard key={article.id} article={article as Article} />
            ))}
          </div>
        </section>
      )}

      {/* CTA strip */}
      <section className="cta-strip">
        <div className="container cta-strip__inner">
          <div>
            <h2 className="cta-strip__title">Own a business in {city.name}?</h2>
            <p className="cta-strip__sub">Get listed and reach locals planning their next outing.</p>
          </div>
          <Link href="/business-signup" className="btn btn--white">List Your Business</Link>
        </div>
      </section>
    </>
  );
}

// ── Inline card components (small, server-safe) ───────────────────────────────

function EventCard({ event, city }: { event: Event; city: string }) {
  return (
    <Link href={`/events/${event.id}`} className="event-card">
      <div className="event-card__img-wrap">
        {event.img
          ? <Image src={event.img} alt={event.title} fill sizes="(max-width: 640px) 100vw, 320px" className="event-card__img" />
          : <div className="event-card__img-placeholder" style={{ background: event.color ?? '#e2e8f0' }}><span>{event.emoji ?? '📅'}</span></div>
        }
        {event.is_promoted && <span className="event-card__promoted">Promoted</span>}
      </div>
      <div className="event-card__body">
        <span className="event-card__cat">{event.category ?? 'Event'}</span>
        <h3 className="event-card__title">{event.title}</h3>
        <p className="event-card__meta">
          {event.date && <span>{event.date}</span>}
          {event.location && <span> · {event.location}</span>}
        </p>
        {event.price && <p className="event-card__price">{event.price}</p>}
      </div>
    </Link>
  );
}

function BusinessCard({ biz }: { biz: Business }) {
  const href = biz.slug ? `/${biz.slug}` : `/listing?id=${biz.id}`;
  return (
    <Link href={href} className="biz-card">
      <div className="biz-card__img-wrap">
        {biz.img
          ? <Image src={biz.img} alt={biz.name} fill sizes="(max-width: 640px) 100vw, 280px" className="biz-card__img" />
          : <div className="biz-card__img-placeholder" style={{ background: biz.color ?? '#e2e8f0' }}><span>{biz.emoji ?? '🏪'}</span></div>
        }
        {biz.is_gold && <span className="biz-card__gold">⭐ Gold</span>}
      </div>
      <div className="biz-card__body">
        <h3 className="biz-card__name">{biz.name}</h3>
        <p className="biz-card__type">{biz.type}</p>
        {biz.suburb && <p className="biz-card__location">{biz.suburb}</p>}
      </div>
    </Link>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/guides/${article.id}`} className="guide-card">
      <div className="guide-card__img-wrap">
        {article.hero_img && (
          <Image src={article.hero_img} alt={article.title} fill sizes="(max-width: 640px) 100vw, 360px" className="guide-card__img" />
        )}
      </div>
      <div className="guide-card__body">
        {article.type && <span className="guide-card__type">{article.type}</span>}
        <h3 className="guide-card__title">{article.title}</h3>
        {article.excerpt && <p className="guide-card__excerpt">{article.excerpt}</p>}
      </div>
    </Link>
  );
}
