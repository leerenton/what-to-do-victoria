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

// ── Date helpers ──────────────────────────────────────────────────────────────

function getWeekendRange(): { satStr: string; sunStr: string; label: string } {
  const today = new Date();
  const day = today.getDay(); // 0=Sun, 6=Sat
  let daysToSat = (6 - day + 7) % 7;
  if (daysToSat === 0 && day !== 6) daysToSat = 7;
  if (day === 0) daysToSat = 6; // today is Sunday, Saturday was yesterday+6
  const sat = new Date(today);
  sat.setDate(today.getDate() + (day === 0 ? -1 : daysToSat));
  const sun = new Date(sat);
  sun.setDate(sat.getDate() + (day === 0 ? 0 : 1));
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  const mo = sat.toLocaleString('en-AU', { month: 'short' });
  const label = `${sat.getDate()}–${sun.getDate()} ${mo}`;
  return { satStr: fmt(sat), sunStr: fmt(sun), label };
}

function fmtUpcomingDate(dateStr: string | null): { day: string; mon: string } {
  if (!dateStr) return { day: '?', mon: '???' };
  const d = new Date(dateStr + 'T00:00:00');
  return {
    day: String(d.getDate()),
    mon: d.toLocaleString('en-AU', { month: 'short' }).toUpperCase(),
  };
}

function fmtEventDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const city = await getCityConfig();
  const supabase = createClient();
  const now = new Date().toISOString().split('T')[0];
  const { satStr, sunStr, label: weekendLabel } = getWeekendRange();

  const [
    { data: featuredEvents },
    { data: weekendEvents },
    { data: upcomingEvents },
    { data: eatBusinesses },
    { data: drinkBusinesses },
    { data: doBusinesses },
    { data: articles },
  ] = await Promise.all([
    supabase.from('events').select('*').eq('city', city.slug).eq('featured', true).gte('date', now).order('date').limit(3),
    supabase.from('events').select('*').eq('city', city.slug).gte('date', satStr).lte('date', sunStr).order('admin_priority', { ascending: false }).order('date').limit(12),
    supabase.from('events').select('*').eq('city', city.slug).gte('date', now).order('date').limit(8),
    supabase.from('businesses').select('*').eq('city', city.slug).eq('section', 'eat').order('admin_priority', { ascending: false }).limit(10),
    supabase.from('businesses').select('*').eq('city', city.slug).eq('section', 'drink').order('admin_priority', { ascending: false }).limit(10),
    supabase.from('businesses').select('*').eq('city', city.slug).eq('section', 'do').order('admin_priority', { ascending: false }).limit(10),
    supabase.from('articles').select('*').eq('approved', true).order('published_at', { ascending: false }).limit(4),
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
          upcomingEvents.map(e => ({ name: e.title, url: `https://${city.domain}/events/${e.id}` }))
        )} />
      )}
      {featuredEvents?.map(e => (
        <JsonLd key={e.id} data={eventSchema(e as Event, city)} />
      ))}

      {/* Datebar */}
      <div className="datebar">
        <div className="container datebar__inner">
          <div className="datebar__ticker">
            {articles?.[0] && (
              <Link href={`/guides/${articles[0].id}`} style={{ color: 'var(--dark)', fontWeight: 600, fontSize: '.82rem', textDecoration: 'none' }}>
                {articles[0].title}
              </Link>
            )}
          </div>
          <div className="datebar__popout-wrap">
            <Link href="/events" className="datebar__btn">
              <span className="material-symbols-rounded" style={{ fontSize: '.9rem', verticalAlign: 'middle' }}>calendar_month</span> Planning a visit?
            </Link>
          </div>
        </div>
      </div>

      {/* Masonry hero */}
      {heroEvents.length > 0 && (
        <section className="masonry-hero">
          <div className="container masonry-hero__grid">
            {mainHero && (
              <Link href={`/events/${mainHero.id}`} className="masonry-hero__main">
                <div className="masonry-hero__img-wrap" style={!mainHero.img ? { background: mainHero.color ?? 'var(--dark)' } : undefined}>
                  {mainHero.img
                    ? <img src={mainHero.img} alt={mainHero.title} loading="eager" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    : mainHero.emoji && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '5rem', opacity: .5 }}>{mainHero.emoji}</span>
                  }
                  <div className="masonry-hero__overlay" />
                </div>
                <div className="masonry-hero__info">
                  <span className="masonry-hero__badge">{mainHero.category ?? 'Event'}</span>
                  <h2 className="masonry-hero__title">{mainHero.title}</h2>
                  <p className="masonry-hero__sub">{fmtEventDate(mainHero.date)}{mainHero.location ? ` · ${mainHero.location}` : ''}</p>
                </div>
              </Link>
            )}
            <div className="masonry-hero__stack">
              {sideHeroes.slice(0, 2).map(e => (
                <Link key={e.id} href={`/events/${e.id}`} className="masonry-hero__small">
                  <div className="masonry-hero__img-wrap" style={!e.img ? { background: e.color ?? 'var(--dark)' } : undefined}>
                    {e.img
                      ? <img src={e.img} alt={e.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      : e.emoji && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '3rem', opacity: .5 }}>{e.emoji}</span>
                    }
                    <div className="masonry-hero__overlay" />
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

      {/* This Weekend */}
      <section className="page-section" id="do">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title"><span className="material-symbols-rounded">weekend</span> This Weekend</h2>
            <span className="date-pill">{weekendLabel}</span>
          </div>
          <div className="weekend-toggle">
            <button className="weekend-toggle__btn weekend-toggle__btn--active">This weekend</button>
            <Link href="/events" className="weekend-toggle__btn">Next weekend →</Link>
          </div>
          {(weekendEvents ?? []).length > 0 ? (
            <>
              <div className="event-scroll">
                {(weekendEvents ?? []).map(e => (
                  <EventScrollCard key={e.id} event={e as Event} />
                ))}
              </div>
              <div className="weekend-see-all">
                <Link href="/events" className="btn btn--outline">See all this weekend →</Link>
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--mid)', fontSize: '.9rem' }}>
              No events this weekend yet — <Link href="/events" style={{ color: 'var(--teal)' }}>browse all upcoming events</Link>.
            </p>
          )}
        </div>
      </section>

      {/* Visit planner card */}
      <div className="container">
        <div className="planner-card">
          <h3 className="planner-card__title">Planning a trip to {city.name}?</h3>
          <p className="planner-card__sub">Browse everything that's on and plan your perfect visit.</p>
          <Link href="/events" className="btn btn--teal btn--full">See all upcoming events →</Link>
        </div>
      </div>

      {/* Coming Up */}
      <section className="page-section" id="upcoming">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title"><span className="material-symbols-rounded">event</span> Coming Up</h2>
            <Link href="/events" className="see-all">See all</Link>
          </div>
          <div className="upcoming-list">
            {(upcomingEvents ?? []).map(e => (
              <UpcomingItem key={e.id} event={e as Event} />
            ))}
          </div>
        </div>
      </section>

      {/* Where to Eat */}
      {(eatBusinesses ?? []).length > 0 && (
        <section className="page-section page-section--alt" id="eat">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title"><span className="material-symbols-rounded">restaurant</span> Where to Eat</h2>
              <Link href="/eat" className="see-all">See all</Link>
            </div>
            <div className="biz-scroll">
              {(eatBusinesses ?? []).map(b => <BizScrollCard key={b.id} biz={b as Business} />)}
            </div>
          </div>
        </section>
      )}

      {/* Where to Drink */}
      {(drinkBusinesses ?? []).length > 0 && (
        <section className="page-section" id="drink">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title"><span className="material-symbols-rounded">local_bar</span> Where to Drink</h2>
              <Link href="/drink" className="see-all">See all</Link>
            </div>
            <div className="biz-scroll">
              {(drinkBusinesses ?? []).map(b => <BizScrollCard key={b.id} biz={b as Business} />)}
            </div>
          </div>
        </section>
      )}

      {/* Things to Do */}
      {(doBusinesses ?? []).length > 0 && (
        <section className="page-section page-section--alt" id="things-to-do">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title"><span className="material-symbols-rounded">explore</span> Things To Do</h2>
              <Link href="/do" className="see-all">See all</Link>
            </div>
            <div className="biz-scroll">
              {(doBusinesses ?? []).map(b => <BizScrollCard key={b.id} biz={b as Business} />)}
            </div>
          </div>
        </section>
      )}

      {/* The Edit */}
      {(articles ?? []).length > 0 && (
        <section className="page-section page-section--alt" id="editorial">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title"><span className="material-symbols-rounded">auto_stories</span> The Edit</h2>
              <Link href="/guides" className="see-all">See all</Link>
            </div>
            <div className="ed-scroll">
              {(articles ?? []).map(a => <EditCard key={a.id} article={a as Article} />)}
            </div>
          </div>
        </section>
      )}

      {/* Personalise banner */}
      <section className="promo-banner">
        <div className="container promo-banner__inner">
          <div>
            <h2 className="promo-banner__title">Own a business in {city.name}?</h2>
            <p className="promo-banner__sub">Get listed free and reach locals planning their next outing.</p>
          </div>
          <Link href="/business-signup" className="btn btn--teal btn--lg">Get started →</Link>
        </div>
      </section>
    </>
  );
}

// ── Card components ───────────────────────────────────────────────────────────

function EventScrollCard({ event }: { event: Event }) {
  return (
    <Link href={`/events/${event.id}`} className="event-card">
      {event.img
        ? <img src={event.img} alt={event.title} className="event-card__thumb-img" loading="lazy" />
        : <div className="event-card__thumb" style={{ background: event.color ?? 'var(--cream)' }}>{event.emoji ?? '📅'}</div>
      }
      <div className="event-card__body">
        <span className="event-card__cat">{event.category ?? 'Event'}</span>
        <h3 className="event-card__title">{event.title}</h3>
        <p className="event-card__meta">
          {event.date && <span>{fmtEventDate(event.date)}</span>}
          {event.location && <span> · {event.location}</span>}
        </p>
        <div className="event-card__cta">{event.price && event.price.toLowerCase() !== 'free' ? event.price : 'Free'}</div>
      </div>
    </Link>
  );
}

function UpcomingItem({ event }: { event: Event }) {
  const { day, mon } = fmtUpcomingDate(event.date);
  return (
    <Link href={`/events/${event.id}`} className="upcoming-item">
      <div className="upcoming-item__date">
        <span className="upcoming-item__day">{day}</span>
        <span className="upcoming-item__mon">{mon}</span>
      </div>
      <div className="upcoming-item__body">
        <span className="upcoming-item__cat">{event.category ?? 'Event'}</span>
        <span className="upcoming-item__title">{event.title}</span>
        <span className="upcoming-item__sub">
          {event.time && <><span className="material-symbols-rounded" style={{ fontSize: '.8rem' }}>schedule</span> {event.time}</>}
          {event.location && <> · {event.location}</>}
        </span>
        {event.price && <span className="upcoming-item__ticket">{event.price}</span>}
      </div>
    </Link>
  );
}

function BizScrollCard({ biz }: { biz: Business }) {
  const href = biz.slug ? `/${biz.slug}` : `/listing?id=${biz.id}`;
  return (
    <Link href={href} className="biz-card">
      {biz.img
        ? <img src={biz.img} alt={biz.name} className="biz-card__img" loading="lazy" />
        : <div className="biz-card__img-placeholder" style={{ background: biz.color ?? 'var(--cream)' }}>{biz.emoji ?? '🏪'}</div>
      }
      <div className="biz-card__body">
        <h3 className="biz-card__name">{biz.name}</h3>
        <p className="biz-card__type">{biz.type}{biz.suburb ? ` · ${biz.suburb}` : ''}</p>
        {biz.is_gold && (
          <div className="biz-card__badges">
            <span className="biz-badge biz-badge--event">⭐ Gold</span>
          </div>
        )}
      </div>
    </Link>
  );
}

function EditCard({ article }: { article: Article }) {
  return (
    <Link href={`/guides/${article.id}`} className="ed-card">
      <div className="ed-card__img-wrap">
        {article.hero_img && (
          <img src={article.hero_img} alt={article.title} className="ed-card__img" loading="lazy" />
        )}
      </div>
      <div className="ed-card__body">
        {article.type && <span className="ed-card__type">{article.type}</span>}
        <h3 className="ed-card__title">{article.title}</h3>
        {article.excerpt && <p className="ed-card__excerpt">{article.excerpt}</p>}
      </div>
    </Link>
  );
}
