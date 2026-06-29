import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCityConfig } from '@/lib/get-city';
import { createClient } from '@/lib/supabase/server';
import { JsonLd, localBusinessSchema, breadcrumbSchema, eventSchema } from '@/lib/structured-data';
import InquiryForm from './InquiryForm';
import SaveButton from './SaveButton';
import type { Business, Event, Promo } from '@/lib/types';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = await getCityConfig();
  const supabase = createClient();

  const { data: biz } = await supabase
    .from('businesses')
    .select('name, description, img, type, suburb')
    .eq('slug', params.slug)
    .eq('city', city.slug)
    .single();

  if (!biz) return { title: 'Not found' };

  return {
    title: `${biz.name} — ${biz.type ?? 'Business'} in ${city.name}`,
    description: biz.description ?? `${biz.name} is a ${biz.type ?? 'business'} in ${biz.suburb ?? city.name}.`,
    openGraph: {
      images: biz.img ? [{ url: biz.img }] : [],
    },
    alternates: { canonical: `https://${city.domain}/${params.slug}` },
  };
}

export default async function ListingPage({ params }: Props) {
  const city = await getCityConfig();
  const supabase = createClient();

  const [
    { data: biz },
    { data: { session } },
  ] = await Promise.all([
    supabase.from('businesses').select('*').eq('slug', params.slug).eq('city', city.slug).single(),
    supabase.auth.getSession(),
  ]);

  if (!biz) notFound();

  const business = biz as Business;

  const [{ data: events }, { data: promos }] = await Promise.all([
    supabase.from('events').select('*').eq('business_id', business.id).order('date').limit(10),
    supabase.from('promos').select('*').eq('business_id', business.id).limit(5),
  ]);

  const sectionLabel = business.section === 'eat' ? 'Eat'
    : business.section === 'drink' ? 'Drink'
    : business.section === 'do' ? 'Do'
    : 'Stay';

  return (
    <>
      <JsonLd data={localBusinessSchema(business, city)} />
      <JsonLd data={breadcrumbSchema([
        { name: city.fullName, url: `https://${city.domain}` },
        { name: sectionLabel, url: `https://${city.domain}/${business.section ?? 'eat'}` },
        { name: business.name, url: `https://${city.domain}/${params.slug}` },
      ])} />
      {(events ?? []).map(e => (
        <JsonLd key={e.id} data={eventSchema(e as Event, city)} />
      ))}

      {/* Hero image */}
      <div className="listing-hero">
        {business.img ? (
          <Image src={business.img} alt={business.name} fill priority sizes="100vw" className="listing-hero__img" />
        ) : (
          <div className="listing-hero__placeholder" style={{ background: business.color ?? '#e2e8f0' }}>
            <span className="listing-hero__emoji">{business.emoji ?? '🏪'}</span>
          </div>
        )}
      </div>

      <div className="listing-body container">
        <div className="listing-main">

          {/* Header */}
          <div className="listing-header">
            <div className="listing-header__meta">
              <span className="listing-header__type">{business.type}</span>
              {business.is_gold && <span className="listing-header__gold">⭐ Gold Member</span>}
            </div>
            <h1 className="listing-header__name">{business.name}</h1>
            {business.suburb && (
              <p className="listing-header__location">
                <span className="material-symbols-rounded">location_on</span> {business.suburb}
              </p>
            )}
            <div className="listing-header__actions">
              {business.website && (
                <a href={business.website} target="_blank" rel="noreferrer noopener" className="btn btn--primary">
                  Visit Website
                </a>
              )}
              {session && <SaveButton itemId={business.id} itemType="business" title={business.name} />}
            </div>
          </div>

          {/* Description */}
          {business.description && (
            <section className="listing-section">
              <p className="listing-desc">{business.description}</p>
            </section>
          )}

          {/* Details */}
          <section className="listing-section listing-details">
            {business.address && (
              <div className="listing-detail">
                <span className="material-symbols-rounded">location_on</span>
                <span>{business.address}</span>
              </div>
            )}
            {business.phone && (
              <div className="listing-detail">
                <span className="material-symbols-rounded">phone</span>
                <a href={`tel:${business.phone}`}>{business.phone}</a>
              </div>
            )}
            {business.hours && (
              <div className="listing-detail">
                <span className="material-symbols-rounded">schedule</span>
                <span>{business.hours}</span>
              </div>
            )}
            {business.website && (
              <div className="listing-detail">
                <span className="material-symbols-rounded">language</span>
                <a href={business.website} target="_blank" rel="noreferrer noopener">{business.website.replace(/^https?:\/\//, '')}</a>
              </div>
            )}
          </section>

          {/* Promos */}
          {(promos ?? []).length > 0 && (
            <section className="listing-section">
              <h2 className="listing-section__title">Offers &amp; Promotions</h2>
              <div className="promo-list">
                {(promos as Promo[]).map(promo => (
                  <div key={promo.id} className="promo-card">
                    <span className="promo-card__emoji">{promo.emoji ?? '🎁'}</span>
                    <div>
                      <p className="promo-card__title">{promo.title}</p>
                      {promo.description && <p className="promo-card__desc">{promo.description}</p>}
                      {promo.expires && <p className="promo-card__expires">Expires {promo.expires}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Upcoming events */}
          {(events ?? []).length > 0 && (
            <section className="listing-section">
              <h2 className="listing-section__title">Upcoming Events</h2>
              <div className="listing-events">
                {(events as Event[]).map(event => (
                  <Link key={event.id} href={`/events/${event.id}`} className="listing-event-row">
                    <div className="listing-event-row__info">
                      <span className="listing-event-row__title">{event.title}</span>
                      <span className="listing-event-row__meta">{event.date} {event.time ? `· ${event.time}` : ''}</span>
                    </div>
                    {event.price && <span className="listing-event-row__price">{event.price}</span>}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Inquiry form */}
          <section className="listing-section">
            <h2 className="listing-section__title">Send a Message</h2>
            <InquiryForm businessId={business.id} businessName={business.name} />
          </section>

          {/* Claim listing */}
          {!business.claimed && (
            <div className="listing-claim">
              <p>Is this your business?</p>
              <Link href={`/business-signup?claim=${business.id}`} className="listing-claim__btn">Claim this listing</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
