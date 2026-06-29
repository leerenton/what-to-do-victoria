import type { Metadata } from 'next';
import Image from 'next/image';
import { getCityConfig } from '@/lib/get-city';
import { createClient } from '@/lib/supabase/server';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/lib/structured-data';
import type { Park } from '@/lib/types';

export async function generateMetadata(): Promise<Metadata> {
  const city = await getCityConfig();
  return {
    title: `Parks & Outdoor Spaces in ${city.name}`,
    description: `Discover the best parks, reserves and outdoor spaces in ${city.name}.`,
    alternates: { canonical: `https://${city.domain}/parks` },
  };
}

export default async function ParksPage() {
  const city = await getCityConfig();
  const supabase = createClient();

  const { data: parks } = await supabase
    .from('parks')
    .select('*')
    .eq('city', city.slug)
    .order('name');

  const parkList = (parks ?? []) as Park[];

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: city.fullName, url: `https://${city.domain}` },
        { name: 'Parks', url: `https://${city.domain}/parks` },
      ])} />
      <JsonLd data={itemListSchema(
        `Parks in ${city.name}`,
        `https://${city.domain}/parks`,
        parkList.slice(0, 20).map(p => ({ name: p.name, url: `https://${city.domain}/parks` }))
      )} />

      <div className="coll-hero">
        <div className="coll-hero__inner container">
          <p className="coll-hero__eyebrow">🌿 Green spaces in {city.name}</p>
          <h1 className="coll-hero__title">Parks &amp; Outdoors</h1>
          <p className="coll-hero__sub">The best parks, reserves and outdoor spaces in {city.name}.</p>
        </div>
      </div>

      <div className="coll-body container">
        <div className="coll-grid">
          {parkList.map(park => (
            <div key={park.id} className="biz-card">
              <div className="biz-card__img-wrap">
                {park.img ? (
                  <Image src={park.img} alt={park.name} fill sizes="(max-width: 640px) 100vw, 280px" className="biz-card__img" />
                ) : (
                  <div className="biz-card__img-placeholder" style={{ background: '#a7f3d0' }}>
                    <span>🌿</span>
                  </div>
                )}
              </div>
              <div className="biz-card__body">
                <h2 className="biz-card__name">{park.name}</h2>
                {park.suburb && <p className="biz-card__location">{park.suburb}</p>}
                {park.description && <p className="biz-card__desc">{park.description}</p>}
              </div>
            </div>
          ))}
          {parkList.length === 0 && <p className="coll-empty">Parks coming soon.</p>}
        </div>
      </div>
    </>
  );
}
