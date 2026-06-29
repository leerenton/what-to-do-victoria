import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCityConfig } from '@/lib/get-city';
import { createClient } from '@/lib/supabase/server';
import { JsonLd, localBusinessSchema, breadcrumbSchema, eventSchema } from '@/lib/structured-data';
import ListingCarousel from './ListingCarousel';
import ListingTabs from './ListingTabs';
import ListingInquiry from './ListingInquiry';
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
    openGraph: { images: biz.img ? [{ url: biz.img }] : [] },
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

  const [{ data: events }, { data: promos }, { data: relatedBiz }, { data: articles }] = await Promise.all([
    supabase.from('events').select('*').eq('business_id', business.id).gte('date', new Date().toISOString().split('T')[0]).order('date').limit(10),
    supabase.from('promos').select('*').eq('business_id', business.id).limit(5),
    supabase.from('businesses')
      .select('id,name,type,slug,suburb,img,emoji,color')
      .eq('city', city.slug)
      .eq('type', business.type ?? '')
      .neq('id', business.id)
      .order('admin_priority', { ascending: false })
      .limit(8),
    supabase.from('articles').select('id,title,type,hero_img,business_ids').eq('approved', true).limit(20),
  ]);

  // Related articles that reference this business
  const relatedArticles = (articles ?? []).filter(a =>
    Array.isArray(a.business_ids) && a.business_ids.includes(business.id)
  ).slice(0, 4);

  // Gallery: main image + any future gallery field
  const galleryImgs = [business.img].filter((s): s is string => !!s);

  // Determine inquiry display logic server-side
  const isOwner = !!(session?.user && business.owner_id && session.user.id === business.owner_id);

  const sectionLabel = business.section === 'eat' ? 'Eat'
    : business.section === 'drink' ? 'Drink'
    : business.section === 'do' ? 'Do'
    : 'Listing';

  const mapsQuery = encodeURIComponent(`${business.name} ${business.suburb ?? city.name}`);
  const mapsUrl = business.lat && business.lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${business.lat},${business.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const mapEmbedUrl = business.lat && business.lng
    ? `https://maps.google.com/maps?q=${business.lat},${business.lng}&z=15&output=embed`
    : `https://maps.google.com/maps?q=${mapsQuery}&z=15&output=embed`;

  const randomRelated = (relatedBiz ?? []).sort(() => Math.random() - 0.5).slice(0, 4);

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

      {/* Hero carousel */}
      <ListingCarousel
        slides={galleryImgs}
        typeBadge={business.type}
        emoji={business.emoji}
        color={business.color}
      />

      {/* Business header */}
      <div className="container">
        <div className="lheader">
          <div className="lheader__left">
            <div className="lident__avatar" style={{ background: `${business.color ?? 'var(--teal)'}22` }}>
              {business.emoji ?? '🏪'}
            </div>
            <div className="lheader__info">
              <h1 className="lident__name">{business.name}</h1>
              <p className="lident__loc">
                <span className="material-symbols-rounded" style={{ fontSize: '.9rem', verticalAlign: 'middle', color: 'var(--teal)' }}>location_on</span>
                {' '}{business.suburb ?? business.location ?? city.name}
              </p>
              {(business.tags ?? []).length > 0 && (
                <div className="listing-tags">
                  {(business.tags as string[]).map(t => (
                    <span key={t} className="listing-tag">{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="lheader__actions">
            {business.website && (
              <a href={business.website.startsWith('http') ? business.website : `https://${business.website}`} target="_blank" rel="noopener noreferrer" className="btn btn--outline btn--sm">
                <span className="material-symbols-rounded">language</span> Website
              </a>
            )}
            {business.phone && (
              <a href={`tel:${business.phone}`} className="btn btn--outline btn--sm">
                <span className="material-symbols-rounded">call</span> Call
              </a>
            )}
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn--teal btn--sm">
              <span className="material-symbols-rounded">directions</span> Directions
            </a>
          </div>
        </div>
      </div>

      {/* Two-column body */}
      <div className="container listing-layout">

        {/* Main column */}
        <div className="listing-main">
          {business.description && (
            <p className="lident__desc">{business.description}</p>
          )}

          <ListingTabs
            events={(events ?? []) as Event[]}
            promos={(promos ?? []) as Promo[]}
          />
        </div>

        {/* Sidebar */}
        <aside className="listing-sidebar">
          {/* Hours */}
          {business.hours && (
            <div className="linfo-card">
              <div className="linfo-card__header">
                <span className="material-symbols-rounded">schedule</span>
                <h3>Opening Hours</h3>
              </div>
              <p style={{ fontSize: '.88rem', color: 'var(--mid)', whiteSpace: 'pre-line', margin: 0 }}>{business.hours}</p>
            </div>
          )}

          {/* Map */}
          <div className="linfo-card linfo-card--map">
            <iframe
              src={mapEmbedUrl}
              width="100%" height="200"
              style={{ border: 0, borderRadius: '14px 14px 0 0', display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="linfo-directions-btn">
              <span className="material-symbols-rounded">directions</span> Get Directions
            </a>
            {business.address && <p className="linfo-address">{business.address}</p>}
          </div>

          {/* Contact */}
          {(business.phone || business.website) && (
            <div className="linfo-card">
              {business.phone && (
                <a href={`tel:${business.phone}`} className="linfo-row">
                  <span className="material-symbols-rounded">call</span>
                  <span>{business.phone}</span>
                </a>
              )}
              {business.website && (
                <a href={business.website.startsWith('http') ? business.website : `https://${business.website}`} target="_blank" rel="noopener noreferrer" className="linfo-row">
                  <span className="material-symbols-rounded">language</span>
                  <span>Visit website</span>
                </a>
              )}
            </div>
          )}

          {/* Personalise CTA */}
          <div className="linfo-card" style={{ background: 'var(--teal-lt,#e8f9f9)', border: '1.5px solid var(--teal)' }}>
            <p style={{ fontSize: '.88rem', color: 'var(--dark)', lineHeight: 1.5, margin: 0 }}>
              Want to stay up to date with places like this?{' '}
              <Link href="/signup" style={{ color: 'var(--teal)', fontWeight: 700 }}>Create a free account →</Link>
            </p>
          </div>
        </aside>
      </div>

      {/* Related articles */}
      {relatedArticles.length > 0 && (
        <div className="container" style={{ paddingBottom: '2rem' }}>
          <h2 className="section-title" style={{ marginBottom: '1rem' }}>
            <span className="material-symbols-rounded">auto_stories</span> From the Edit
          </h2>
          <div className="ed-scroll">
            {relatedArticles.map(a => (
              <Link key={a.id} href={`/guides/${a.id}`} className="ed-card">
                <div className="ed-card__img-wrap">
                  {a.hero_img && <img src={a.hero_img} alt={a.title} className="ed-card__img" loading="lazy" />}
                </div>
                <div className="ed-card__body">
                  {a.type && <span className="ed-card__type">{a.type}</span>}
                  <h3 className="ed-card__title">{a.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Inquiry / claim section */}
      <div className="container listing-body" style={{ paddingBottom: '2rem' }}>
        <ListingInquiry
          businessId={business.id}
          businessName={business.name}
          businessSlug={business.slug}
          website={business.website}
          isClaimed={business.claimed}
          isGold={business.is_gold}
          isOwner={isOwner}
        />
      </div>

      {/* Related businesses */}
      {randomRelated.length > 0 && (
        <div className="container" style={{ paddingBottom: '3rem' }}>
          <div className="listing-related">
            <h2 className="listing-related__title">
              <span className="material-symbols-rounded">storefront</span>
              More {business.type} in {city.name}
            </h2>
            <div className="listing-related__grid">
              {randomRelated.map(r => (
                <Link key={r.id} href={`/${r.slug}`} className="listing-related__card">
                  <div
                    className="listing-related__img"
                    style={r.img ? { backgroundImage: `url('${r.img}')` } : { background: r.color ?? '#e5e7eb' }}
                  >
                    {!r.img && <span style={{ fontSize: '1.8rem' }}>{r.emoji ?? ''}</span>}
                  </div>
                  <div className="listing-related__body">
                    <div className="listing-related__name">{r.name}</div>
                    <div className="listing-related__sub">{r.suburb ?? city.name}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
